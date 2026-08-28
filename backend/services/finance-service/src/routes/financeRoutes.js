const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const paymentController = require('../controllers/paymentController');

// Mock auth middleware for now, in reality import from shared lib or similar
const authMiddleware = (req, res, next) => {
  // Pass through for now or implement real JWT verification if we had the certs
  req.user = { userId: 'admin123', role: 'admin' };
  next();
};

const router = express.Router();

// Invoices
router.post('/invoices', authMiddleware, invoiceController.generateInvoice);
router.get('/invoices', authMiddleware, invoiceController.getInvoices);

// Payments
router.post('/payments', authMiddleware, paymentController.processPayment);

module.exports = router;
