const AuditLog   = require('../models/AuditLog');
const Department = require('../models/Department');
const Semester   = require('../models/Semester');
const axios      = require('axios');

// ── Internal service URLs ──────────────────────────────────────────────────
const AUTH_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:3001';
const USER_URL    = process.env.USER_SERVICE_URL    || 'http://localhost:3002';
const COURSE_URL  = process.env.COURSE_SERVICE_URL  || 'http://localhost:3003';
const NOTIF_URL   = process.env.NOTIF_SERVICE_URL   || 'http://localhost:3004';
const ASSESS_URL  = process.env.ASSESS_SERVICE_URL  || 'http://localhost:3005';
const ASSIGN_URL  = process.env.ASSIGN_SERVICE_URL  || 'http://localhost:3006';
const CERT_URL    = process.env.CERT_SERVICE_URL    || 'http://localhost:3007';
const ATTEND_URL  = process.env.ATTEND_SERVICE_URL  || 'http://localhost:3008';
const TT_URL      = process.env.TT_SERVICE_URL      || 'http://localhost:3009';
const CAL_URL     = process.env.CAL_SERVICE_URL     || 'http://localhost:3010';
const LIB_URL     = process.env.LIB_SERVICE_URL     || 'http://localhost:3011';
const PLACE_URL   = process.env.PLACE_SERVICE_URL   || 'http://localhost:3012';
const DISC_URL    = process.env.DISC_SERVICE_URL    || 'http://localhost:3013';
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3014';

const ALL_SERVICES = [
  { name: 'auth-service',         url: AUTH_URL,     port: 3001 },
  { name: 'user-service',         url: USER_URL,     port: 3002 },
  { name: 'course-service',       url: COURSE_URL,   port: 3003 },
  { name: 'notification-service', url: NOTIF_URL,    port: 3004 },
  { name: 'assessment-service',   url: ASSESS_URL,   port: 3005 },
  { name: 'assignment-service',   url: ASSIGN_URL,   port: 3006 },
  { name: 'certificate-service',  url: CERT_URL,     port: 3007 },
  { name: 'attendance-service',   url: ATTEND_URL,   port: 3008 },
  { name: 'timetable-service',    url: TT_URL,       port: 3009 },
  { name: 'calendar-service',     url: CAL_URL,      port: 3010 },
  { name: 'library-service',      url: LIB_URL,      port: 3011 },
  { name: 'placement-service',    url: PLACE_URL,    port: 3012 },
  { name: 'discussion-service',   url: DISC_URL,     port: 3013 },
  { name: 'analytics-service',    url: ANALYTICS_URL, port: 3014 },
];

// ── Real System Health ─────────────────────────────────────────────────────
exports.getHealth = async (req, res) => {
  const results = await Promise.allSettled(
    ALL_SERVICES.map(async (svc) => {
      const start = Date.now();
      try {
        await axios.get(`${svc.url}/health`, { timeout: 3000 });
        return { name: svc.name, status: 'UP', latency: `${Date.now() - start}ms`, port: svc.port };
      } catch {
        return { name: svc.name, status: 'DOWN', latency: 'N/A', port: svc.port };
      }
    })
  );
  const microservices = results.map(r => r.value || r.reason);
  const allUp = microservices.every(s => s.status === 'UP');
  res.json({
    status: allUp ? 'healthy' : 'degraded',
    uptime: Math.round(process.uptime()),
    microservices,
  });
};

// ── Backup ─────────────────────────────────────────────────────────────────
exports.triggerBackup = async (req, res) => {
  try {
    const log = new AuditLog({
      action: 'db_backup', userId: req.user.userId,
      username: req.user.username, details: 'Manual DB backup triggered'
    });
    await log.save();
    res.json({ message: 'Database backup completed successfully.', timestamp: new Date() });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── Audit Logs ─────────────────────────────────────────────────────────────
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await AuditLog.countDocuments(filter);
    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── Departments ────────────────────────────────────────────────────────────
exports.getDepartments = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.active = active !== 'false';
    const departments = await Department.find(filter).sort({ name: 1 });
    res.json({ departments, total: departments.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    const log = new AuditLog({ action: 'dept_created', userId: req.user.userId, username: req.user.username, details: `Created department: ${dept.name}` });
    await log.save();
    res.status(201).json(dept);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Department with that name or code already exists' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(dept);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deactivateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deactivated', dept });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── Semesters ──────────────────────────────────────────────────────────────
exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ startDate: -1 });
    res.json({ semesters, total: semesters.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createSemester = async (req, res) => {
  try {
    const semester = await Semester.create(req.body);
    res.status(201).json(semester);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!semester) return res.status(404).json({ error: 'Semester not found' });
    res.json(semester);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.activateSemester = async (req, res) => {
  try {
    // Deactivate any currently active semester first
    await Semester.updateMany({ status: 'active' }, { status: 'completed' });
    const semester = await Semester.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!semester) return res.status(404).json({ error: 'Semester not found' });
    const log = new AuditLog({ action: 'semester_activated', userId: req.user.userId, username: req.user.username, details: `Activated semester: ${semester.name}` });
    await log.save();
    res.json({ message: 'Semester activated', semester });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── User Management (delegates to user-service) ────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { q, role, page = 1, limit = 20 } = req.query;
    const params = { page, limit };
    if (q) params.q = q;
    if (role) params.role = role;
    const token = req.headers.authorization;
    const response = await axios.get(`${USER_URL}/`, {
      params,
      headers: { Authorization: token },
      timeout: 5000
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({ error: error.response?.data?.error || 'Failed to fetch users from user-service' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.post(`${AUTH_URL}/register`, req.body, {
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      timeout: 5000
    });
    const log = new AuditLog({ action: 'user_created', userId: req.user.userId, username: req.user.username, details: `Created user: ${req.body.username || req.body.email}` });
    await log.save();
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({ error: error.response?.data?.error || 'Failed to create user' });
  }
};

exports.bulkUpdateUsers = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.patch(`${USER_URL}/bulk`, req.body, {
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      timeout: 5000
    });
    const log = new AuditLog({
      action: 'users_bulk_updated',
      userId: req.user.userId,
      username: req.user.username,
      details: `Bulk updated ${req.body.userIds?.length || 0} user profiles`
    });
    await log.save();
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({ error: error.response?.data?.error || 'Failed to bulk update users' });
  }
};