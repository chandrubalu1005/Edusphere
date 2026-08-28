const Loan = require('../models/Loan');
const Fine = require('../models/Fine');
const LoanEvent = require('../models/LoanEvent');
const crypto = require('crypto');
const { publishEvent } = require('../config/rabbitmq');

async function processOverdueLoans() {
  console.log('Running overdue loans detection and fine accumulation job...');
  try {
    const now = new Date();
    // Find all ACTIVE loans where due date has passed OR loans that are already OVERDUE
    const targetLoans = await Loan.find({ 
      $or: [
        { status: 'ACTIVE', dueAt: { $lt: now } },
        { status: 'OVERDUE' }
      ]
    }).populate({ path: 'memberId', populate: { path: 'borrowingPolicyId' }});
    
    let newlyOverdueCount = 0;
    let finesUpdatedCount = 0;

    for (const loan of targetLoans) {
      const policy = loan.memberId.borrowingPolicyId;
      const gracePeriod = policy ? policy.gracePeriodDays : 0;
      const finePerDay = policy ? policy.finePerDay : 1.0;
      const maxFine = policy ? policy.maximumFineAmount : 100.0;
      
      const graceLimit = new Date(loan.dueAt);
      graceLimit.setDate(graceLimit.getDate() + gracePeriod);

      // 1. Mark loan as overdue if it isn't already
      if (loan.status === 'ACTIVE' && now > loan.dueAt) {
        loan.status = 'OVERDUE';
        await loan.save();
        newlyOverdueCount++;
        
        await LoanEvent.create({
          loanId: loan._id,
          eventType: 'LOAN_OVERDUE',
          memberId: loan.memberId._id,
          bookCopyId: loan.bookCopyId,
          performedBy: 'SYSTEM',
          metadata: {}
        });

        if (typeof publishEvent === 'function') {
          publishEvent('library.book_overdue', { loanId: loan._id });
        }
      }

      // 2. Accrue Fines if past grace period
      if (now > graceLimit) {
         // Calculate days overdue
         const daysOverdue = Math.floor((now - graceLimit) / (1000 * 60 * 60 * 24));
         if (daysOverdue > 0) {
           let calculatedFineAmount = daysOverdue * finePerDay;
           if (calculatedFineAmount > maxFine) {
             calculatedFineAmount = maxFine;
           }

           const existingFine = await Fine.findOne({ loanId: loan._id, type: 'OVERDUE' });
           if (!existingFine) {
             const fine = await Fine.create({
               fineNumber: `FN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
               memberId: loan.memberId._id,
               loanId: loan._id,
               type: 'OVERDUE',
               amount: calculatedFineAmount,
               balance: calculatedFineAmount,
               reason: `Loan overdue by ${daysOverdue} days`,
               createdBy: 'SYSTEM'
             });
             finesUpdatedCount++;

             if (typeof publishEvent === 'function') {
               publishEvent('library.fine_created', { fineId: fine._id });
             }
           } else {
             // Accumulate fine dynamically
             if (existingFine.amount < calculatedFineAmount) {
                const diff = calculatedFineAmount - existingFine.amount;
                existingFine.amount = calculatedFineAmount;
                existingFine.balance += diff;
                existingFine.reason = `Loan overdue by ${daysOverdue} days`;
                await existingFine.save();
                finesUpdatedCount++;
             }
           }
         }
      }
    }
    console.log(`Processed ${newlyOverdueCount} newly overdue loans and updated ${finesUpdatedCount} fines.`);
  } catch (error) {
    console.error('Error in overdue job:', error);
  }
}

module.exports = { processOverdueLoans };
