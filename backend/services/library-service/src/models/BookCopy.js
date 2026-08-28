const mongoose = require('mongoose');

const BookCopySchema = new mongoose.Schema({
  bookTitleId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookTitle', required: true, index: true },
  libraryBranchId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBranch', required: true, index: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', index: true },
  accessionNumber: { type: String, required: true, unique: true },
  barcode: { type: String, unique: true, sparse: true },
  qrCode: { type: String },
  callNumber: { type: String },
  acquisitionDate: { type: Date },
  acquisitionSource: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // To be implemented later
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  purchasePrice: { type: Number },
  currency: { type: String, default: 'USD' },
  condition: { type: String, enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'], default: 'GOOD' },
  status: { 
    type: String, 
    enum: ['PROCESSING', 'AVAILABLE', 'ISSUED', 'RESERVED', 'IN_TRANSIT', 'LOST', 'MISSING', 'DAMAGED', 'UNDER_REPAIR', 'WITHDRAWN'], 
    default: 'PROCESSING',
    index: true
  },
  notes: { type: String },
  lastInventoryAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('BookCopy', BookCopySchema);
