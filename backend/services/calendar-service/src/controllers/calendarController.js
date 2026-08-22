const CalendarEvent = require('../models/CalendarEvent');
exports.getEvents = async (req, res) => {
  try {
    const { targetAudience, month } = req.query;
    const filter = {};
    if (month) filter.date = new RegExp(`^${month}`); // Assuming YYYY-MM prefix
    
    // Default to global events, plus role-specific events
    const allowedAudiences = ['global', req.user.role];
    if (targetAudience) {
       // if they request a specific audience, make sure they are allowed to see it
       if (req.user.role !== 'admin' && !allowedAudiences.includes(targetAudience)) {
           return res.status(403).json({ error: 'Forbidden audience' });
       }
       filter.targetAudience = targetAudience;
    } else if (req.user.role !== 'admin') {
       filter.targetAudience = { $in: allowedAudiences };
    }
    
    res.json(await CalendarEvent.find(filter).sort({ date: 1 }));
  } catch (error) { res.status(500).json({ error: error.message }); }
};
exports.createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    const ev = new CalendarEvent(req.body);
    await ev.save();
    res.status(201).json(ev);
  } catch (error) { res.status(500).json({ error: error.message }); }
};