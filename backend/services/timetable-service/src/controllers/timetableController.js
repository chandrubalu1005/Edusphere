const Timetable = require('../models/Timetable');

function checkOverlap(t1Start, t1End, t2Start, t2End) {
  // Assuming HH:MM format
  return t1Start < t2End && t1End > t2Start;
}

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
    const { instructorId, room, day, timeStart, timeEnd, department, semester } = req.body;
    
    // Conflict resolution engine
    const existingSlots = await Timetable.find({ day });
    for (const slot of existingSlots) {
      if (checkOverlap(timeStart, timeEnd, slot.timeStart, slot.timeEnd)) {
        if (slot.instructorId === instructorId) {
          return res.status(409).json({ error: `Instructor conflict: Instructor is already booked for ${slot.title}` });
        }
        if (slot.room === room) {
          return res.status(409).json({ error: `Room conflict: Room ${room} is already booked for ${slot.title}` });
        }
        if (slot.department === department && slot.semester === semester) {
          return res.status(409).json({ error: `Student group conflict: ${department} Semester ${semester} already has ${slot.title}` });
        }
      }
    }
    
    const slot = new Timetable(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (error) { res.status(500).json({ error: error.message }); }
};