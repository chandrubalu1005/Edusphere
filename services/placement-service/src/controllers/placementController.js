const PlacementDrive = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');
exports.getDrives = async (req, res) => {
  try { res.json(await PlacementDrive.find()); } catch (error) { res.status(500).json({ error: error.message }); }
};
exports.getApplications = async (req, res) => {
  try { res.json(await PlacementApplication.find({ studentId: req.params.studentId })); } catch (error) { res.status(500).json({ error: error.message }); }
};
exports.createDrive = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'management') return res.status(403).json({ error: 'Access denied' });
    const dr = new PlacementDrive(req.body);
    await dr.save();
    res.status(201).json(dr);
  } catch (error) { res.status(500).json({ error: error.message }); }
};