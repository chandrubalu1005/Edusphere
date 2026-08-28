const InventorySession = require('../models/InventorySession');
const InventoryScan = require('../models/InventoryScan');
const InventoryDiscrepancy = require('../models/InventoryDiscrepancy');
const BookCopy = require('../models/BookCopy');
const crypto = require('crypto');

exports.startSession = async (req, res) => {
  try {
    const { branchId, locationId, notes } = req.body;

    // Calculate expected copies
    const filter = { libraryBranchId: branchId, status: { $in: ['AVAILABLE', 'PROCESSING'] } };
    if (locationId) filter.locationId = locationId;
    
    const expectedCopies = await BookCopy.countDocuments(filter);

    const session = await InventorySession.create({
      sessionNumber: `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      branchId,
      locationId,
      startedBy: req.user.userId,
      totalExpected: expectedCopies,
      notes
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.scanCopy = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { barcode, accessionNumber, foundLocationId, condition } = req.body;

    const session = await InventorySession.findById(sessionId);
    if (!session || session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_SESSION', message: 'Session is not active' } });
    }

    const query = barcode ? { barcode } : { accessionNumber };
    const copy = await BookCopy.findOne(query);
    
    if (!copy) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Book copy not found in system' } });
    }

    // Idempotency: Prevent double scanning
    const existingScan = await InventoryScan.findOne({ sessionId: session._id, bookCopyId: copy._id });
    if (existingScan) {
      return res.status(200).json({ success: true, message: 'Already scanned in this session', data: { scan: existingScan, copy } });
    }

    // Check if it belongs to this session's scope
    let isExpected = true;
    if (session.branchId.toString() !== copy.libraryBranchId.toString()) isExpected = false;
    if (session.locationId && copy.locationId && session.locationId.toString() !== copy.locationId.toString()) isExpected = false;

    const scan = await InventoryScan.create({
      sessionId: session._id,
      bookCopyId: copy._id,
      scannedBy: req.user.userId,
      locationId: foundLocationId || copy.locationId,
      isExpected,
      condition: condition || copy.condition
    });

    session.totalScanned += 1;
    
    if (!isExpected) {
      session.totalMisplaced += 1;
      await InventoryDiscrepancy.create({
        sessionId: session._id,
        bookCopyId: copy._id,
        type: 'MISPLACED',
        expectedLocationId: copy.locationId,
        foundLocationId: foundLocationId || copy.locationId,
        expectedStatus: copy.status,
        foundStatus: 'AVAILABLE'
      });
    } else if (condition && condition !== copy.condition) {
      await InventoryDiscrepancy.create({
         sessionId: session._id,
         bookCopyId: copy._id,
         type: 'CONDITION_MISMATCH',
         expectedStatus: copy.condition,
         foundStatus: condition
      });
    }

    // Update actual copy
    copy.lastInventoryAt = new Date();
    if (condition) copy.condition = condition;
    if (foundLocationId) copy.locationId = foundLocationId;
    await copy.save();
    
    await session.save();

    res.json({ success: true, data: { scan, copy } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InventorySession.findById(sessionId);
    
    if (!session || session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_SESSION', message: 'Session is not active' } });
    }

    // Find expected but not scanned
    const filter = { libraryBranchId: session.branchId, status: { $in: ['AVAILABLE'] } };
    if (session.locationId) filter.locationId = session.locationId;
    
    const expectedCopies = await BookCopy.find(filter).select('_id');
    const scannedRecords = await InventoryScan.find({ sessionId: session._id }).select('bookCopyId');
    const scannedSet = new Set(scannedRecords.map(s => s.bookCopyId.toString()));

    let missingCount = 0;
    for (const copy of expectedCopies) {
      if (!scannedSet.has(copy._id.toString())) {
        missingCount++;
        await InventoryDiscrepancy.create({
          sessionId: session._id,
          bookCopyId: copy._id,
          type: 'MISSING',
          expectedStatus: 'AVAILABLE',
          foundStatus: 'MISSING'
        });
        
        // Mark actual copy as missing
        await BookCopy.findByIdAndUpdate(copy._id, { status: 'MISSING' });
      }
    }

    session.totalMissing = missingCount;
    session.status = 'COMPLETED';
    session.completedAt = new Date();
    await session.save();

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
