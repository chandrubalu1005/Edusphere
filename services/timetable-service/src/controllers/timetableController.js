const Timetable = require('../models/Timetable');
exports.getTimetables = async (req, res) => {
  try {
    const { department, semester, instructorId } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (instructorId) filter.instructorId = instructorId;
    const list = await Timetable.find(filter);
    res.json(list);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
exports.createSlot = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    const slot = new Timetable(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (error) { res.status(500).json({ error: error.message }); }
};