const mongoose = require('mongoose');
const TimetableSchema = new mongoose.Schema({
  courseId: String, code: String, title: String, instructorId: String, instructorName: String,
  room: String, day: String, timeStart: String, timeEnd: String, department: String, semester: String
});
module.exports = mongoose.model('Timetable', TimetableSchema);