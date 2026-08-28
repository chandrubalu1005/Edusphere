const Invoice = require('../models/Invoice');
const PaymentTransaction = require('../models/PaymentTransaction');
const crypto = require('crypto');

exports.processPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, referenceId } = req.body;
    const studentId = req.user ? req.user.userId : req.body.studentId;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Invoice cannot be paid' } });
    if (amount <= 0) return res.status(400).json({ success: false, error: { code: 'INVALID_AMOUNT', message: 'Amount must be greater than zero' } });

    // In a real system, this is where we'd hit Stripe/Razorpay API. 
    // Here we'll simulate a successful processing step.

    const transaction = await PaymentTransaction.create({
      transactionId: referenceId || `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amount,
      paymentMethod,
      status: 'SUCCESS',
      processedBy: req.user ? req.user.userId : 'SYSTEM'
    });

    invoice.paidAmount += amount;
    invoice.balanceDue -= amount;

    if (invoice.balanceDue <= 0) {
      invoice.status = 'PAID';
      invoice.balanceDue = 0; // handle slight overpayment float issues if any
    } else {
      invoice.status = 'PARTIALLY_PAID';
    }

    await invoice.save();

    res.json({ success: true, data: { transaction, invoice } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
