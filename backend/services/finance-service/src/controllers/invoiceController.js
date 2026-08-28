const Invoice = require('../models/Invoice');
const FeeStructure = require('../models/FeeStructure');
const Scholarship = require('../models/Scholarship');
const crypto = require('crypto');

exports.generateInvoice = async (req, res) => {
  try {
    const { studentId, departmentId, semester, academicYear, feeStructureIds, scholarshipIds, dueDate, notes } = req.body;

    // Fetch Fee Structures
    const structures = await FeeStructure.find({ _id: { $in: feeStructureIds } });
    if (structures.length !== feeStructureIds.length) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_FEES', message: 'One or more fee structures are invalid' } });
    }

    let subtotal = 0;
    const lineItems = structures.map(fee => {
      subtotal += fee.amount;
      return {
        feeStructureId: fee._id,
        description: `${fee.feeType} Fee - Sem ${fee.semester}`,
        amount: fee.amount
      };
    });

    // Fetch Scholarships
    let totalDiscount = 0;
    const scholarshipList = [];
    if (scholarshipIds && scholarshipIds.length > 0) {
      const scholarships = await Scholarship.find({ _id: { $in: scholarshipIds } });
      scholarships.forEach(schol => {
        let appliedAmount = 0;
        if (schol.type === 'FIXED_AMOUNT') {
          appliedAmount = schol.value;
        } else if (schol.type === 'PERCENTAGE') {
          // Calculate percentage against applicable fees
          let applicableBase = 0;
          structures.forEach(fee => {
             if (!schol.applicableFeeTypes || schol.applicableFeeTypes.length === 0 || schol.applicableFeeTypes.includes(fee.feeType)) {
               applicableBase += fee.amount;
             }
          });
          appliedAmount = applicableBase * (schol.value / 100);
          if (schol.maxAmount && appliedAmount > schol.maxAmount) appliedAmount = schol.maxAmount;
        }
        totalDiscount += appliedAmount;
        scholarshipList.push({
          scholarshipId: schol._id,
          description: schol.name,
          amountApplied: appliedAmount
        });
      });
    }

    // Ensure we don't discount more than the subtotal
    if (totalDiscount > subtotal) totalDiscount = subtotal;

    const totalAmount = subtotal - totalDiscount;

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      studentId,
      departmentId,
      semester,
      academicYear,
      lineItems,
      scholarships: scholarshipList,
      subtotal,
      totalDiscount,
      totalAmount,
      balanceDue: totalAmount,
      dueDate,
      notes
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
