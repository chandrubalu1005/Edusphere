const PlacementDrive       = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');
const PDFDocument = require('pdfkit');

exports.getDrives = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const drives = await PlacementDrive.find(filter).sort({ date: 1 });
    res.json({ drives, total: drives.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await PlacementApplication
      .find({ studentId: req.params.studentId })
      .populate ? await PlacementApplication.find({ studentId: req.params.studentId }).sort({ appliedAt: -1 })
      : await PlacementApplication.find({ studentId: req.params.studentId });
    res.json({ applications, total: applications.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createDrive = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'management') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const dr = new PlacementDrive(req.body);
    await dr.save();
    res.status(201).json(dr);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.applyToDrive = async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
  const { driveId } = req.body;
  if (!driveId) return res.status(400).json({ error: 'driveId is required' });
  try {
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    if (drive.status !== 'active') return res.status(400).json({ error: 'Drive is no longer accepting applications' });
    // Atomic create — let the DB unique index (driveId, studentId) enforce deduplication.
    // No findOne needed; code 11000 = duplicate key = already applied.
    const application = await PlacementApplication.create({
      driveId,
      studentId:   req.user.userId,
      studentName: req.user.username,
      appliedAt:   new Date(),
      status:      'applied',
    });
    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'You have already applied to this drive' });
    res.status(500).json({ error: error.message });
  }
};

exports.getDriveApplicants = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'management' && req.user.role !== 'faculty') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const applications = await PlacementApplication.find({ driveId: req.params.driveId }).sort({ appliedAt: -1 });
    res.json({ applications, total: applications.length, driveId: req.params.driveId });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const { publishEvent } = require('../config/rabbitmq');

exports.updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'management') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const app = await PlacementApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!app) return res.status(404).json({ error: 'Application not found' });

    publishEvent('placement.status_updated', {
      studentId: app.studentId,
      driveId: app.driveId,
      status: app.status
    });

    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buildResume = async (req, res) => {
  try {
    const { name, email, phone, education, experience, skills } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name.replace(/\s+/g, '_')}_Resume.pdf"`
    });

    doc.pipe(res);

    // Header
    doc.fontSize(24).text(name, { align: 'center' });
    doc.fontSize(12).text(`${email} | ${phone || ''}`, { align: 'center' });
    doc.moveDown();

    // Education
    if (education && education.length > 0) {
      doc.fontSize(16).text('Education', { underline: true });
      doc.moveDown(0.5);
      education.forEach(edu => {
        doc.fontSize(12).text(`${edu.degree} - ${edu.institution} (${edu.year})`);
      });
      doc.moveDown();
    }

    // Experience
    if (experience && experience.length > 0) {
      doc.fontSize(16).text('Experience', { underline: true });
      doc.moveDown(0.5);
      experience.forEach(exp => {
        doc.fontSize(12).text(`${exp.role} at ${exp.company} (${exp.duration})`);
        if (exp.description) {
          doc.fontSize(10).text(exp.description, { indent: 20 });
        }
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Skills
    if (skills && skills.length > 0) {
      doc.fontSize(16).text('Skills', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(skills.join(', '));
    }

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};