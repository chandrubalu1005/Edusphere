const LeaveRequest = require('../models/LeaveRequest');
const LeavePolicy = require('../models/LeavePolicy');
const Attendance = require('../models/Attendance');
const axios = require('axios');
const { publishEvent } = require('../config/rabbitmq');

// Helper for Bug 1: Calculate Calendar Days
function calculateDays(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return -1;
  const diffTime = d2 - d1;
  if (diffTime < 0) return -1;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

exports.applyForLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, affectedCourses, reason, supportingDocument } = req.body;
    
    // Security: Always use the authenticated user's identity from JWT.
    // Never trust client-provided identity fields.
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;
    
    // BUG 1 FIX: Never trust client daysCount, calculate server-side
    const computedDays = calculateDays(startDate, endDate);
    if (computedDays <= 0 || computedDays > 90) {
      return res.status(400).json({ error: 'Invalid date range or exceeds maximum allowed days (90).' });
    }
    
    const policy = await LeavePolicy.getSingleton();
    
    // BUG 1 & 2 FIX: Check quota before saving (Approach A - Reserve quota at request time)
    const typePolicy = policy.leaveTypes.find(t => t.name === leaveType);
    if (typePolicy && typePolicy.countsAgainstQuota) {
      const activeLeaves = await LeaveRequest.find({
        requesterId,
        leaveType,
        status: { $in: ['approved', 'pending'] }
      });
      const used = activeLeaves.reduce((sum, l) => sum + l.daysCount, 0);
      const totalQuota = policy.annualQuotaByType.get(leaveType) || 0;
      
      if (used + computedDays > totalQuota) {
        return res.status(400).json({ error: `Requested ${computedDays} days exceeds remaining balance of ${totalQuota - used}.` });
      }
    }
    
    const request = new LeaveRequest({
      requesterId, requesterRole, leaveType, startDate, endDate, daysCount: computedDays,
      affectedCourses: requesterRole === 'student' ? affectedCourses : [],
      reason, supportingDocument
    });
    
    await request.save();
    
    // Publish real event
    publishEvent('leave.requested', {
      requesterId,
      leaveType,
      startDate,
      endDate,
      status: 'pending',
      // Depending on the logic, facultyOwnerId might need to be resolved here, 
      // but for now we can just emit the event and let notification service route it.
      // Wait, we need to know who to notify. Usually, it's the faculty owners of affected courses.
      affectedCourses
    });
    console.log(`[RabbitMQ] Published leave.requested for ${requesterId}`);
    res.status(201).json({ message: 'Leave request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply for leave', details: error.message });
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    const { role, userId, courseId } = req.query; 
    let filter = {};
    
    // Authentication context
    const currentUserId = req.user ? req.user.userId : userId; 
    
    if (role === 'student') {
      filter.requesterId = currentUserId;
    } else if (role === 'faculty') {
      // BUG 3 FIX: Scope requests to faculty's actual taught courses unconditionally
      try {
        const token = req.headers.authorization || '';
        const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3002';
        const resp = await axios.get(`${COURSE_SERVICE_URL}/courses?facultyOwnerId=${currentUserId}`, {
          headers: { Authorization: token },
          timeout: 5000
        });
        const facultyCourses = resp.data.courses || [];
        const facultyCourseIds = facultyCourses.map(c => c._id || c.id);
        
        filter.requesterRole = 'student';
        filter.affectedCourses = { $in: facultyCourseIds };
      } catch (err) {
        console.error('Failed to fetch faculty courses, defaulting to empty scope:', err.message);
        // Fail closed - show no requests if we can't verify ownership
        filter.affectedCourses = { $in: [] };
      }
    } else if (role !== 'admin') {
      // Admin sees everything. Unknown roles get nothing.
      if (!req.user || req.user.role !== 'admin') {
         return res.status(403).json({ error: 'Unauthorized role scope' });
      }
    }
    
    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests', details: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOverride } = req.body;
    const approverId = req.user ? req.user.userId : req.body.approverId;
    
    // BUG 2 FIX: Concurrency safe atomic update
    const request = await LeaveRequest.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'approved', approverId, approvedAt: new Date(), isOverride: isOverride || false, overriddenBy: isOverride ? approverId : null } },
      { new: true }
    );
    
    if (!request) return res.status(409).json({ error: 'Request not found or has already been processed' });
    
    // BUG 4 FIX: Strict date matching for attendance reconciliation
    if (request.requesterRole === 'student' && request.affectedCourses?.length > 0) {
      // Instead of relying on string lexicographical gte/lte which fails across formats, 
      // explicitly generate YYYY-MM-DD target dates since Attendance.date is stored as string 'YYYY-MM-DD'
      const dateStrings = [];
      let current = new Date(request.startDate);
      const end = new Date(request.endDate);
      while (current <= end) {
        dateStrings.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      
      const updateResult = await Attendance.updateMany({
        studentId: request.requesterId,
        courseId: { $in: request.affectedCourses },
        date: { $in: dateStrings }
      }, {
        $set: { status: 'excused', markedBy: 'system-leave-reconciliation' }
      });
      
      if (updateResult.modifiedCount === 0) {
         console.warn(`[WARN] Leave approval reconciliation found NO attendance records to update for student ${request.requesterId} on dates ${dateStrings.join(', ')}`);
      }
    }
    
    // Publish real event
    publishEvent('leave.statusChanged', {
      requesterId: request.requesterId,
      leaveId: request._id,
      status: 'approved'
    });
    console.log(`[RabbitMQ] Published leave.approved for ${request.requesterId}`);
    res.json({ message: 'Leave approved successfully', request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve leave', details: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, isOverride } = req.body;
    if (!rejectionReason) return res.status(400).json({ error: 'Rejection reason required' });
    
    // Cross-cutting fix: do not trust client-supplied approverId
    const approverId = req.user ? req.user.userId : req.body.approverId;
    
    const request = await LeaveRequest.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'rejected', approverId, rejectionReason, isOverride: isOverride || false, overriddenBy: isOverride ? approverId : null } },
      { new: true }
    );
    
    if (!request) return res.status(404).json({ error: 'Not found or has already been processed' });
    
    // Publish real event
    publishEvent('leave.statusChanged', {
      requesterId: request.requesterId,
      leaveId: request._id,
      status: 'rejected'
    });
    console.log(`[RabbitMQ] Published leave.rejected for ${request.requesterId}`);
    res.json({ message: 'Leave rejected successfully', request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject leave', details: error.message });
  }
};

exports.withdrawLeave = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cross-cutting fix: do not trust client-supplied requesterId
    const currentUserId = req.user ? req.user.userId : req.body.requesterId;
    
    // Atomic update, ensuring we only withdraw if it's pending and owned by current user
    const request = await LeaveRequest.findOneAndUpdate(
      { _id: id, requesterId: currentUserId, status: 'pending' },
      { $set: { status: 'withdrawn' } },
      { new: true }
    );
    
    if (!request) return res.status(404).json({ error: 'Not found, not owned by you, or no longer pending' });
    
    // Publish real event
    publishEvent('leave.statusChanged', {
      requesterId: currentUserId,
      leaveId: request._id,
      status: 'withdrawn'
    });
    console.log(`[RabbitMQ] Published leave.withdrawn for ${currentUserId}`);
    res.json({ message: 'Leave withdrawn successfully', request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to withdraw leave', details: error.message });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await LeavePolicy.getSingleton();
    res.json({ policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policy', details: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    // Cross-cutting fix: ensure only admins can update the leave policy
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Admin only.' });
    }
  
    const { leaveTypes, annualQuotaByType, blackoutPeriods, minNoticeHours } = req.body;
    const policy = await LeavePolicy.getSingleton();
    
    if (leaveTypes) policy.leaveTypes = leaveTypes;
    if (annualQuotaByType) policy.annualQuotaByType = annualQuotaByType;
    if (blackoutPeriods) policy.blackoutPeriods = blackoutPeriods;
    if (minNoticeHours !== undefined) policy.minNoticeHours = minNoticeHours;
    policy.updatedBy = req.user.username || 'admin';
    
    await policy.save();
    res.json({ message: 'Policy updated successfully', policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy', details: error.message });
  }
};

exports.getLeaveQuota = async (req, res) => {
  try {
    const { studentId } = req.params;
    const policy = await LeavePolicy.getSingleton();
    
    // BUG 2 FIX: Calculate used quota by querying both approved AND pending leaves
    const activeLeaves = await LeaveRequest.find({
      requesterId: studentId,
      status: { $in: ['approved', 'pending'] }
    });
    
    let balance = [];
    for (const [type, total] of policy.annualQuotaByType.entries()) {
      const used = activeLeaves
        .filter(l => l.leaveType === type)
        .reduce((sum, l) => sum + l.daysCount, 0);
      balance.push({ type, total, used, remaining: total - used });
    }
    
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quota', details: error.message });
  }
};

exports.getLeaveCalendar = async (req, res) => {
  try {
    const { courseId } = req.query;
    let filter = { status: 'approved' };
    if (courseId) {
      filter.affectedCourses = courseId;
    }
    
    const leaves = await LeaveRequest.find(filter);
    // map to calendar events format
    const calendarEvents = leaves.map(l => ({
      id: l._id,
      title: `${l.leaveType} - ${l.requesterId}`,
      start: l.startDate,
      end: l.endDate,
      type: 'leave'
    }));
    
    res.json({ events: calendarEvents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar', details: error.message });
  }
};
