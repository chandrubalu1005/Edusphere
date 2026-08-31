const fs = require('fs');

// 1. Update attendanceRoutes.js
let routes = fs.readFileSync('backend/services/attendance-service/src/routes/attendanceRoutes.js', 'utf8');
if (!routes.includes('otp-attendance/submit')) {
  routes = routes.replace(
    'module.exports = router;',
    `// OTP Attendance
router.get('/otp-attendance/sessions',        authMiddleware, attendanceController.getOtpSessions);
router.post('/otp-attendance/submit',         authMiddleware, attendanceController.submitOtp);

module.exports = router;`
  );
  fs.writeFileSync('backend/services/attendance-service/src/routes/attendanceRoutes.js', routes);
}

// 2. Update attendanceController.js
let ctrl = fs.readFileSync('backend/services/attendance-service/src/controllers/attendanceController.js', 'utf8');

if (!ctrl.includes('getOtpSessions = async')) {
  // Inject pin generation in createQRSession
  ctrl = ctrl.replace(
    'const sessionId = uuidv4();',
    `const sessionId = uuidv4();
    const pin = Math.floor(100000 + Math.random() * 900000).toString();`
  );
  
  ctrl = ctrl.replace(
    'await QRSession.create({ sessionId, courseId, date, facultyId: req.user.userId, windowMins, expiresAt, latitude, longitude, radius });',
    'await QRSession.create({ sessionId, courseId, date, facultyId: req.user.userId, windowMins, expiresAt, latitude, longitude, radius, pin });'
  );
  
  ctrl = ctrl.replace(
    'JSON.stringify({ courseId, date, facultyId: req.user.userId, expiresAt, latitude, longitude, radius })',
    'JSON.stringify({ courseId, date, facultyId: req.user.userId, expiresAt, latitude, longitude, radius, pin })'
  );
  
  ctrl = ctrl.replace(
    'res.status(201).json({ sessionId, expiresAt, qrBase64, courseId, date, windowMins });',
    'res.status(201).json({ sessionId, expiresAt, qrBase64, courseId, date, windowMins, pin });'
  );

  // Add the OTP endpoints
  const newEndpoints = `
exports.getOtpSessions = async (req, res) => {
  try {
    const sessions = await QRSession.find({ active: true, expiresAt: { $gt: new Date() } }).select('_id courseId');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitOtp = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;
    const session = await QRSession.findOne({ _id: sessionId, active: true });
    if (!session || session.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Session expired or not found' });
    }
    if (session.pin !== otp) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }
    
    await Attendance.findOneAndUpdate(
      { studentId: req.user.userId, courseId: session.courseId, date: session.date },
      { status: 'present', method: 'otp' },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
`;
  ctrl += newEndpoints;
  fs.writeFileSync('backend/services/attendance-service/src/controllers/attendanceController.js', ctrl);
}

// 3. Update QRSession model to store PIN
let modelPath = 'backend/services/attendance-service/src/models/AttendanceSession.js';
if (fs.existsSync(modelPath)) {
  let model = fs.readFileSync(modelPath, 'utf8');
  if (!model.includes('pin: { type: String')) {
    model = model.replace('windowMins: { type: Number, default: 10 },', "windowMins: { type: Number, default: 10 },\n  pin: { type: String },");
    fs.writeFileSync(modelPath, model);
  }
} else {
  // Try QRSession.js instead
  modelPath = 'backend/services/attendance-service/src/models/QRSession.js';
  if (fs.existsSync(modelPath)) {
    let model = fs.readFileSync(modelPath, 'utf8');
    if (!model.includes('pin: { type: String')) {
      model = model.replace('windowMins: { type: Number, default: 10 },', "windowMins: { type: Number, default: 10 },\n  pin: { type: String },");
      fs.writeFileSync(modelPath, model);
    }
  }
}

// 4. Update FacultyPortal.jsx to display the live PIN
let fp = fs.readFileSync('frontend/src/portals/FacultyPortal.jsx', 'utf8');
fp = fp.replace(/742819/g, "{sessionData?.pin || '------'}");
fs.writeFileSync('frontend/src/portals/FacultyPortal.jsx', fp);

console.log('Success BUG-002 Patched');
