const PlacementDrive       = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');

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
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
    const { driveId } = req.body;
    if (!driveId) return res.status(400).json({ error: 'driveId is required' });

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    if (drive.status !== 'active') return res.status(400).json({ error: 'Drive is no longer accepting applications' });

    const existing = await PlacementApplication.findOne({ driveId, studentId: req.user.userId });
    if (existing) return res.status(409).json({ error: 'You have already applied to this drive' });

    const application = await PlacementApplication.create({
      driveId,
      studentId: req.user.userId,
      studentName: req.user.username,
      appliedAt: new Date(),
      status: 'applied',
    });
    res.status(201).json(application);
  } catch (error) { res.status(500).json({ error: error.message }); }
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