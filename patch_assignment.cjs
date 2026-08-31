const fs = require('fs');

let serverTs = fs.readFileSync('backend/services/assignment-service/src/server.ts', 'utf8');

serverTs = serverTs.replace(
  "app.use('/uploads', express.static(UPLOAD_DIR));",
  "app.use('/uploads/assignments', express.static(UPLOAD_DIR));"
);

fs.writeFileSync('backend/services/assignment-service/src/server.ts', serverTs);

console.log('Success assignment-service server.ts patched');
