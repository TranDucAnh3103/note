const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Note = require('./models/Note');
const Folder = require('./models/Folder');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const migrate = async () => {
  await connectDB();

  try {
    // 1. Create a default admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@memostack.local' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@memostack.local',
        password: 'password123',
        role: 'ADMIN',
      });
      console.log('Created default admin user');
    }

    // 2. Update all Notes to belong to this admin user if they don't have a userId
    const notesResult = await Note.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    console.log(`Updated ${notesResult.modifiedCount} Notes to belong to Admin`);

    // 3. Update all Folders
    const foldersResult = await Folder.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    console.log(`Updated ${foldersResult.modifiedCount} Folders to belong to Admin`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
