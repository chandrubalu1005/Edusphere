const mongoose = require('mongoose');
mongoose.connect('mongodb://chandru:Bitsathy%40123@ac-ijyhicf-shard-00-00.59hbnn7.mongodb.net:27017,ac-ijyhicf-shard-00-01.59hbnn7.mongodb.net:27017,ac-ijyhicf-shard-00-02.59hbnn7.mongodb.net:27017/edusphere?ssl=true&replicaSet=atlas-pfl5hi-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(async () => {
    const result = await mongoose.connection.db.collection('profiles').updateMany({}, { $set: { active: true } });
    console.log('Updated profiles:', result.modifiedCount);
    const usersResult = await mongoose.connection.db.collection('users').updateMany({}, { $set: { isActive: true } });
    console.log('Updated users:', usersResult.modifiedCount);
    process.exit(0);
  });
