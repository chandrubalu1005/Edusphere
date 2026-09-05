const mongoose = require('mongoose');

const uri = "mongodb://chandru:Bitsathy%40123@ac-ijyhicf-shard-00-00.59hbnn7.mongodb.net:27017,ac-ijyhicf-shard-00-01.59hbnn7.mongodb.net:27017,ac-ijyhicf-shard-00-02.59hbnn7.mongodb.net:27017/edusphere?ssl=true&replicaSet=atlas-pfl5hi-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected");
    const Attendance = require('./backend/services/attendance-service/src/models/Attendance');
    const User = require('./backend/services/user-service/src/models/User');

    const u = await User.findOne({ username: 'student_1' });
    console.log("User student_1 ID:", u._id.toString());

    const count = await Attendance.countDocuments({ studentId: u._id.toString() });
    console.log("Attendance records count for student_1:", count);

    const sample = await Attendance.findOne({ studentId: u._id.toString() });
    console.log("Sample attendance:", sample);
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
