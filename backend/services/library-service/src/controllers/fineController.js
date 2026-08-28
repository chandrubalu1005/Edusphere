const Fine = require('../models/Fine');
const FineTransaction = require('../models/FineTransaction');
const crypto = require('crypto');

exports.getFines = async (req, res) => {
  try {
    const { memberId, status } = req.query;
    const filter = {};
    if (memberId) filter.memberId = memberId;
    if (status) filter.status = status;

    const fines = await Fine.find(filter).sort({ calculatedAt: -1 });
    res.json({ success: true, data: fines });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.payFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, referenceId } = req.body;

    const fine = await Fine.findById(id);
    if (!fine) return res.status(404).json({ success: false, error: { code: 'FINE_NOT_FOUND', message: 'Fine not found' } });
    if (fine.status === 'PAID' || fine.status === 'WAIVED') return res.status(400).json({ success: false, error: { code: 'ALREADY_SETTLED', message: 'Fine is already paid or waived' } });

    if (amount > fine.balance) {
      return res.status(400).json({ success: false, error: { code: 'OVERPAYMENT', message: 'Payment amount exceeds balance' } });
    }

    const transaction = await FineTransaction.create({
      transactionNumber: `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      fineId: fine._id,
      memberId: fine.memberId,
      type: 'PAYMENT',
      amount,
      paymentMethod,
      referenceId,
      processedBy: req.user.userId
    });

    fine.paidAmount += amount;
    fine.balance -= amount;
    if (fine.balance <= 0) {
      fine.status = 'PAID';
    } else {
      fine.status = 'PARTIALLY_PAID';
    }
    await fine.save();

    res.json({ success: true, data: { fine, transaction } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.waiveFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const fine = await Fine.findById(id);
    if (!fine) return res.status(404).json({ success: false, error: { code: 'FINE_NOT_FOUND', message: 'Fine not found' } });
    if (fine.balance <= 0) return res.status(400).json({ success: false, error: { code: 'NO_BALANCE', message: 'Fine has no balance to waive' } });

    const waiveAmount = amount || fine.balance;

    const transaction = await FineTransaction.create({
      transactionNumber: `WAIVE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      fineId: fine._id,
      memberId: fine.memberId,
      type: 'WAIVER',
      amount: waiveAmount,
      notes: reason,
      processedBy: req.user.userId
    });

    fine.waivedAmount += waiveAmount;
    fine.balance -= waiveAmount;
    fine.waivedBy = req.user.userId;
    fine.waiverReason = reason;

    if (fine.balance <= 0) {
      fine.status = 'WAIVED';
    } else {
      fine.status = 'PARTIALLY_PAID';
    }
    await fine.save();

    res.json({ success: true, data: { fine, transaction } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
