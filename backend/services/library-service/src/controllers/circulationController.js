const mongoose = require('mongoose');
const Fine = require('../models/Fine');
const Loan = require('../models/Loan');
const LoanEvent = require('../models/LoanEvent');
const BookCopy = require('../models/BookCopy');
const BookTitle = require('../models/BookTitle');
const LibraryMember = require('../models/LibraryMember');
const BorrowingPolicy = require('../models/BorrowingPolicy');
const { publishEvent } = require('../config/rabbitmq');
const crypto = require('crypto');

// Utility to calculate due date
const calculateDueDate = (policy) => {
  const days = policy ? policy.loanPeriodDays : 14; // Default to 14 if no policy found
  const due = new Date();
  due.setDate(due.getDate() + days);
  return due;
};

exports.issueBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { memberId, copyId } = req.body;
    
    // 1. Verify member
    const member = await LibraryMember.findById(memberId).populate('borrowingPolicyId').session(session);
    if (!member) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: { code: 'MEMBER_NOT_FOUND', message: 'Library member not found' } });
    }
    if (member.status !== 'ACTIVE') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_RESTRICTED', message: 'Member account is not active' } });
    }
    
    // Check max loans limit
    const policy = member.borrowingPolicyId;
    const maxLoans = policy ? policy.maximumActiveLoans : 3;
    const activeLoansCount = await Loan.countDocuments({ memberId: member._id, status: { $in: ['ACTIVE', 'OVERDUE'] } }).session(session);
    if (activeLoansCount >= maxLoans) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, error: { code: 'LOAN_LIMIT_REACHED', message: `Maximum of ${maxLoans} active loans reached` } });
    }

    // 2. Atomically lock copy
    const copy = await BookCopy.findOneAndUpdate(
      { _id: copyId, status: 'AVAILABLE' },
      { $set: { status: 'ISSUED' } },
      { new: true, session }
    );
    if (!copy) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ success: false, error: { code: 'COPY_NOT_AVAILABLE', message: 'Copy is not available' } });
    }

    // 3. Create Loan
    const loanArray = await Loan.create([{
      loanNumber: `LN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      memberId: member._id,
      bookCopyId: copy._id,
      libraryBranchId: copy.libraryBranchId,
      issuedBy: req.user.userId,
      dueAt: calculateDueDate(policy),
      conditionAtIssue: copy.condition
    }], { session });
    const loan = loanArray[0];

    // 4. Create LoanEvent
    await LoanEvent.create([{
      loanId: loan._id,
      eventType: 'LOAN_CREATED',
      memberId: member._id,
      bookCopyId: copy._id,
      performedBy: req.user.userId,
      metadata: { dueDate: loan.dueAt }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // 5. Publish Event (Post transaction)
    if (typeof publishEvent === 'function') {
      publishEvent('library.book_issued', { loanId: loan._id, memberId: member._id, copyId: copy._id });
    }

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.returnBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params; // loanId
    const { conditionAtReturn, notes } = req.body;

    const loan = await Loan.findById(id).session(session);
    if (!loan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: { code: 'LOAN_NOT_FOUND', message: 'Loan not found' } });
    }
    if (loan.status === 'RETURNED') {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ success: false, error: { code: 'ALREADY_RETURNED', message: 'Loan is already returned' } });
    }

    // 1. Update Loan
    loan.status = 'RETURNED';
    loan.returnedAt = new Date();
    loan.returnedBy = req.user.userId;
    if (conditionAtReturn) loan.conditionAtReturn = conditionAtReturn;
    if (notes) loan.notes = notes;
    await loan.save({ session });

    // 2. Update Copy
    const newStatus = conditionAtReturn === 'DAMAGED' ? 'DAMAGED' : 'AVAILABLE';
    const copy = await BookCopy.findByIdAndUpdate(loan.bookCopyId, { status: newStatus, condition: conditionAtReturn || loan.conditionAtIssue }, { new: true, session });

    // 3. Create Event
    await LoanEvent.create([{
      loanId: loan._id,
      eventType: 'LOAN_RETURNED',
      memberId: loan.memberId,
      bookCopyId: loan.bookCopyId,
      performedBy: req.user.userId,
      metadata: { condition: conditionAtReturn }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // 4. Publish Event
    if (typeof publishEvent === 'function') {
      publishEvent('library.book_returned', { loanId: loan._id, copyId: loan.bookCopyId });
      publishEvent('library.book_available', { copyId: loan.bookCopyId, titleId: copy ? copy.bookTitleId : null });
    }

    res.json({ success: true, data: loan });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.renewLoan = async (req, res) => {
  try {
    const { id } = req.params; // loanId

    const loan = await Loan.findById(id).populate({ path: 'memberId', populate: { path: 'borrowingPolicyId' } });
    if (!loan) return res.status(404).json({ success: false, error: { code: 'LOAN_NOT_FOUND', message: 'Loan not found' } });
    if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE') return res.status(409).json({ success: false, error: { code: 'INVALID_STATE', message: 'Only active or overdue loans can be renewed' } });

    // Logical Fix: Block renewal if overdue and fines are unpaid
    if (loan.status === 'OVERDUE') {
       const unpaidFine = await Fine.findOne({ loanId: loan._id, balance: { $gt: 0 } });
       if (unpaidFine) {
          return res.status(403).json({ success: false, error: { code: 'UNPAID_FINES', message: 'Cannot renew an overdue book with unpaid fines. Please clear fines first.' } });
       }
    }

    const member = loan.memberId;
    const policy = member.borrowingPolicyId;
    const maxRenewals = policy ? policy.maximumRenewals : 1;

    if (loan.renewalCount >= maxRenewals) {
      return res.status(403).json({ success: false, error: { code: 'RENEWAL_LIMIT_REACHED', message: `Maximum of ${maxRenewals} renewals reached` } });
    }

    // Update loan
    const oldDueDate = loan.dueAt;
    loan.dueAt = calculateDueDate(policy);
    loan.renewalCount += 1;
    loan.status = 'ACTIVE'; 
    await loan.save();

    await LoanEvent.create({
      loanId: loan._id,
      eventType: 'LOAN_RENEWED',
      memberId: loan.memberId,
      bookCopyId: loan.bookCopyId,
      performedBy: req.user.userId,
      metadata: { oldDueDate, newDueDate: loan.dueAt, renewalCount: loan.renewalCount }
    });

    if (typeof publishEvent === 'function') {
      publishEvent('library.book_renewed', { loanId: loan._id });
    }

    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const { memberId, status } = req.query;
    const filter = {};
    if (memberId) filter.memberId = memberId;
    if (status) filter.status = status;

    const loans = await Loan.find(filter).populate('bookCopyId').sort({ createdAt: -1 });
    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
