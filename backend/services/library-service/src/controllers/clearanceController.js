const Loan = require('../models/Loan');
const Fine = require('../models/Fine');
const LibraryMember = require('../models/LibraryMember');

exports.getClearanceStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const member = await LibraryMember.findOne({ userId });
    if (!member) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Library member not found' } });
    }

    const activeLoans = await Loan.find({ memberId: member._id, status: { $in: ['ACTIVE', 'OVERDUE'] } });
    const unpaidFines = await Fine.find({ memberId: member._id, status: { $in: ['UNPAID', 'PARTIALLY_PAID'] } });

    const totalFineBalance = unpaidFines.reduce((sum, fine) => sum + fine.balance, 0);

    const isCleared = activeLoans.length === 0 && totalFineBalance === 0;

    res.json({
      success: true,
      data: {
        isCleared,
        activeLoansCount: activeLoans.length,
        activeLoans: activeLoans.map(l => ({
          loanId: l._id,
          loanNumber: l.loanNumber,
          dueDate: l.dueAt,
          status: l.status
        })),
        totalFineBalance,
        unpaidFines: unpaidFines.map(f => ({
          fineId: f._id,
          fineNumber: f.fineNumber,
          balance: f.balance,
          type: f.type
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
