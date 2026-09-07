require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function main() {
  const MONGO_URI_ATTENDANCE = process.env.MONGO_URI_ATTENDANCE;
  const MONGO_URI_CALENDAR = process.env.MONGO_URI_CALENDAR;
  const MONGO_URI_DISCUSSIONS = process.env.MONGO_URI_DISCUSSIONS;
  
  const connAtt = await mongoose.createConnection(MONGO_URI_ATTENDANCE).asPromise();
  await connAtt.db.collection('attendances').deleteMany({});
  await connAtt.db.collection('leaves').drop().catch(()=>console.log('leaves drop failed'));
  await connAtt.db.collection('leavebalances').deleteMany({});
  await connAtt.db.collection('leaverequests').deleteMany({});
  await connAtt.close();
  
  const connCal = await mongoose.createConnection(MONGO_URI_CALENDAR).asPromise();
  await connCal.db.collection('events').drop().catch(()=>console.log('events drop failed'));
  await connCal.db.collection('calendarevents').deleteMany({}).catch(()=>console.log('calendarevents drop failed'));
  await connCal.close();
  
  const connDisc = await mongoose.createConnection(MONGO_URI_DISCUSSIONS).asPromise();
  await connDisc.db.collection('threads').drop().catch(()=>console.log('threads drop failed'));
  await connDisc.db.collection('discussionthreads').deleteMany({}).catch(()=>console.log('discussionthreads drop failed'));
  await connDisc.db.collection('discussionreplies').deleteMany({}).catch(()=>console.log('discussionreplies drop failed'));
  await connDisc.close();
  
  console.log('Cleanup completed');
  process.exit(0);
}
main();
