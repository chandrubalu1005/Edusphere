const CalendarEvent = require('../models/CalendarEvent');
exports.getEvents = async (req, res) => {
  try { res.json(await CalendarEvent.find()); } catch (error) { res.status(500).json({ error: error.message }); }
};
exports.createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    const ev = new CalendarEvent(req.body);
    await ev.save();
    res.status(201).json(ev);
  } catch (error) { res.status(500).json({ error: error.message }); }
};