const mongoose = require('mongoose');
const CalendarEventSchema = new mongoose.Schema({
  title: String, description: String, date: String, type: String, targetAudience: String
});
module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);