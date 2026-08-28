const Loan = require('../models/Loan');
const Fine = require('../models/Fine');
const BookCopy = require('../models/BookCopy');
const DigitalResource = require('../models/DigitalResource');

exports.getLibraryKPIs = async (req, res) => {
  try {
    // 1. Circulation Metrics
    const totalActiveLoans = await Loan.countDocuments({ status: 'ACTIVE' });
    const totalOverdueLoans = await Loan.countDocuments({ status: 'OVERDUE' });
    
    // 2. Financial Metrics
    const unpaidFinesAggregate = await Fine.aggregate([
      { $match: { status: { $in: ['UNPAID', 'PARTIALLY_PAID'] } } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    const totalUnpaidFines = unpaidFinesAggregate.length > 0 ? unpaidFinesAggregate[0].totalBalance : 0;

    // 3. Inventory Metrics
    const totalPhysicalCopies = await BookCopy.countDocuments();
    const missingCopies = await BookCopy.countDocuments({ status: 'MISSING' });

    // 4. Digital Metrics
    const digitalUsageAggregate = await DigitalResource.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { 
          _id: null, 
          totalViews: { $sum: '$viewCount' }, 
          totalDownloads: { $sum: '$downloadCount' } 
      } }
    ]);
    const digitalViews = digitalUsageAggregate.length > 0 ? digitalUsageAggregate[0].totalViews : 0;
    const digitalDownloads = digitalUsageAggregate.length > 0 ? digitalUsageAggregate[0].totalDownloads : 0;

    res.json({
      success: true,
      data: {
        circulation: {
          activeLoans: totalActiveLoans,
          overdueLoans: totalOverdueLoans
        },
        financials: {
          unpaidFines: totalUnpaidFines
        },
        inventory: {
          totalCopies: totalPhysicalCopies,
          missingCopies: missingCopies,
          missingPercentage: totalPhysicalCopies > 0 ? ((missingCopies / totalPhysicalCopies) * 100).toFixed(2) : 0
        },
        digital: {
          totalViews: digitalViews,
          totalDownloads: digitalDownloads
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
