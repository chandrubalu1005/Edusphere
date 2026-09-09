const fs = require('fs');
const path = require('path');

// 1. Update circulationController
const circPath = path.join(__dirname, 'backend/services/library-service/src/controllers/circulationController.js');
let circContent = fs.readFileSync(circPath, 'utf8');

// Inject AuditRecord
circContent = circContent.replace(
  /const crypto = require\('crypto'\);/,
  "const crypto = require('crypto');\nconst AuditRecord = require('../models/AuditRecord');\nconst { getIO } = require('../config/socket');"
);

// Inject in issueBook
circContent = circContent.replace(
  /await publishEvent\('library_exchange', 'LIBRARY_LOAN_CREATED', \{\s*loanId: loan._id,\s*memberId: member._id,\s*copyId: copy._id\s*\}\);/,
  `await publishEvent('library_exchange', 'LIBRARY_LOAN_CREATED', {
        loanId: loan._id,
        memberId: member._id,
        copyId: copy._id
      });
      
      await AuditRecord.create([{
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'LIBRARY_LOAN_CREATED',
        resourceId: loan._id.toString(),
        resourceModel: 'Loan',
        status: 'SUCCESS'
      }], { session });

      getIO().to('library:admin').emit('LIBRARY_LOAN_CREATED', { loanId: loan._id });
`
);

// Inject in returnBook
circContent = circContent.replace(
  /await publishEvent\('library_exchange', 'LIBRARY_LOAN_RETURNED', \{\s*loanId: loan._id\s*\}\);/,
  `await publishEvent('library_exchange', 'LIBRARY_LOAN_RETURNED', {
        loanId: loan._id
      });
      
      await AuditRecord.create([{
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'LIBRARY_LOAN_RETURNED',
        resourceId: loan._id.toString(),
        resourceModel: 'Loan',
        status: 'SUCCESS'
      }], { session });

      getIO().to('library:admin').emit('LIBRARY_LOAN_RETURNED', { loanId: loan._id });
`
);

fs.writeFileSync(circPath, circContent, 'utf8');

// 2. Update reservationController
const resPath = path.join(__dirname, 'backend/services/library-service/src/controllers/reservationController.js');
let resContent = fs.readFileSync(resPath, 'utf8');

resContent = resContent.replace(
  /const \{ publishEvent \} = require\('\.\.\/config\/rabbitmq'\);/,
  "const { publishEvent } = require('../config/rabbitmq');\nconst AuditRecord = require('../models/AuditRecord');\nconst { getIO } = require('../config/socket');"
);

// Inject in createReservation
resContent = resContent.replace(
  /await publishEvent\('library_exchange', 'LIBRARY_RESERVATION_CREATED', \{\s*reservationId: reservation._id\s*\}\);/,
  `await publishEvent('library_exchange', 'LIBRARY_RESERVATION_CREATED', {
        reservationId: reservation._id
      });
      
      await AuditRecord.create([{
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'LIBRARY_RESERVATION_CREATED',
        resourceId: reservation._id.toString(),
        resourceModel: 'Reservation',
        status: 'SUCCESS'
      }], { session });

      getIO().to('library:admin').emit('LIBRARY_RESERVATION_CREATED', { reservationId: reservation._id });
`
);

fs.writeFileSync(resPath, resContent, 'utf8');
console.log('Successfully injected AuditRecord and Socket.IO events into controllers');
