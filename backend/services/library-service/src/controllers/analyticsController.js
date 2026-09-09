const Loan = require('../models/Loan');
const Fine = require('../models/Fine');
const BookCopy = require('../models/BookCopy');
const DigitalResource = require('../models/DigitalResource');
const CourseResource = require('../models/CourseResource');
const AuditRecord = require('../models/AuditRecord');

exports.getLibraryKPIs = async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    // RBAC: HODs can only request their own department's KPIs
    if (req.user.role === 'hod') {
      if (!departmentId || departmentId !== req.user.departmentId) {
        await AuditRecord.create({
          actorId: req.user.id, actorRole: req.user.role,
          action: 'ANALYTICS_VIEW', resourceId: departmentId || 'ALL',
          resourceModel: 'Department', status: 'DENIED', reason: 'HOD Scope Violation'
        });
        return res.status(403).json({ success: false, error: { message: 'HODs can only view their own department' } });
      }
    }

    const matchStage = departmentId ? { $match: { departmentId } } : { $match: {} };

    // Unit 1-5 Coverage (CourseResource specific metrics)
    const unitCoverage = await CourseResource.aggregate([
      matchStage,
      { $match: { status: 'ACTIVE' } },
      { $group: {
          _id: '$unitNumber',
          resourceCount: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);

    // Active Courses with Resources
    const activeCourses = await CourseResource.distinct('courseOfferingId', departmentId ? { departmentId, status: 'ACTIVE' } : { status: 'ACTIVE' });

    // Resource Types Breakdown
    const resourceTypes = await CourseResource.aggregate([
      matchStage,
      { $match: { status: 'ACTIVE' } },
      { $group: {
          _id: '$resourceType',
          count: { $sum: 1 }
      } }
    ]);

    // General Institutional Circulation (Management/Admin)
    let circulation = { activeLoans: 0, overdueLoans: 0 };
    let financials = { unpaidFines: 0 };
    let inventory = { totalCopies: 0, missingCopies: 0, missingPercentage: 0 };

    if (!departmentId) { // Only fetch global library state if not scoping to a department
      circulation.activeLoans = await Loan.countDocuments({ status: 'ACTIVE' });
      circulation.overdueLoans = await Loan.countDocuments({ status: 'OVERDUE' });
      
      const unpaidFinesAggregate = await Fine.aggregate([
        { $match: { status: { $in: ['UNPAID', 'PARTIALLY_PAID'] } } },
        { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
      ]);
      financials.unpaidFines = unpaidFinesAggregate.length > 0 ? unpaidFinesAggregate[0].totalBalance : 0;

      inventory.totalCopies = await BookCopy.countDocuments();
      inventory.missingCopies = await BookCopy.countDocuments({ status: 'MISSING' });
      inventory.missingPercentage = inventory.totalCopies > 0 ? ((inventory.missingCopies / inventory.totalCopies) * 100).toFixed(2) : 0;
    }

    res.json({
      success: true,
      data: {
        academic: {
          coursesWithResources: activeCourses.length,
          unitCoverage: unitCoverage.map(u => ({ unit: `Unit ${u._id}`, count: u.resourceCount })),
          resourceTypes: resourceTypes.map(r => ({ type: r._id, count: r.count }))
        },
        circulation,
        financials,
        inventory,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
