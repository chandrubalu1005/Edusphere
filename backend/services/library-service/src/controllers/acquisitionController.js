const AcquisitionRequest = require('../models/AcquisitionRequest');
const PurchaseOrder = require('../models/PurchaseOrder');
const ReceivingRecord = require('../models/ReceivingRecord');
const Vendor = require('../models/Vendor');
const crypto = require('crypto');

exports.requestAcquisition = async (req, res) => {
  try {
    const { title, authors, isbn, format, reason, priority, departmentId } = req.body;
    const request = await AcquisitionRequest.create({
      requestedBy: req.user.userId,
      title,
      authors,
      isbn,
      format,
      reason,
      priority,
      departmentId
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.approveAcquisition = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body; // 'APPROVED' or 'REJECTED'
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only admins can review requests' } });
    }

    const request = await AcquisitionRequest.findByIdAndUpdate(
      id,
      { status, reviewedBy: req.user.userId, reviewNotes },
      { new: true }
    );
    
    if (!request) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { vendorId, items, expectedDeliveryAt, notes } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only admins can create POs' } });
    }

    let totalAmount = 0;
    items.forEach(item => {
       totalAmount += (item.quantity * item.unitPrice);
    });

    const po = await PurchaseOrder.create({
      poNumber: `PO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      vendorId,
      generatedBy: req.user.userId,
      totalAmount,
      items,
      expectedDeliveryAt,
      notes
    });

    // Update any linked acquisition requests to 'ORDERED'
    for (const item of items) {
      if (item.acquisitionRequestId) {
        await AcquisitionRequest.findByIdAndUpdate(item.acquisitionRequestId, { status: 'ORDERED' });
      }
    }

    res.status(201).json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.receiveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, invoiceNumber, deliveryNotes } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only admins can receive POs' } });
    }

    const po = await PurchaseOrder.findById(id);
    if (!po || po.status === 'FULFILLED' || po.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PO', message: 'PO is invalid or already closed' } });
    }

    const receiving = await ReceivingRecord.create({
      purchaseOrderId: po._id,
      receivedBy: req.user.userId,
      invoiceNumber,
      deliveryNotes,
      items
    });

    // Update PO item received quantities
    let allFulfilled = true;
    for (const poItem of po.items) {
      const receivedItem = items.find(i => i.poItemId.toString() === poItem._id.toString());
      if (receivedItem) {
        poItem.receivedQuantity += receivedItem.quantityReceived;
      }
      if (poItem.receivedQuantity < poItem.quantity) {
        allFulfilled = false;
      }
    }

    po.status = allFulfilled ? 'FULFILLED' : 'PARTIAL';
    await po.save();

    res.json({ success: true, data: { receiving, poStatus: po.status } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
