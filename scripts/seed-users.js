const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = 'mongodb+srv://chandru:Bitsathy%40123@cluster0.59hbnn7.mongodb.net/edusphere_auth?retryWrites=true&w=majority';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'faculty', 'admin', 'management'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected! Seeding users...');

    // Clear existing users to start fresh
    await User.deleteMany({});
    console.log('Cleared existing users collection.');

    const hashedPassword = await bcrypt.hash('Bitsathy@123', 10);

    const usersToCreate = [
      {
        username: 'chandru',
        email: 'chandru@edusphere.edu',
        password: hashedPassword,
        role: 'student'
      },
      {
        username: 'chandru_faculty',
        email: 'chandru_faculty@edusphere.edu',
        password: hashedPassword,
        role: 'faculty'
      },
      {
        username: 'chandru_admin',
        email: 'chandru_admin@edusphere.edu',
        password: hashedPassword,
        role: 'admin'
      },
      {
        username: 'chandru_management',
        email: 'chandru_management@edusphere.edu',
        password: hashedPassword,
        role: 'management'
      }
    ];

    for (const u of usersToCreate) {
      const newUser = new User(u);
      await newUser.save();
      console.log(`Created user: ${u.username} (${u.role})`);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
