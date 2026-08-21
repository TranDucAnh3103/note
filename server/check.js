require('dotenv').config({ path: 'f:/Build/MemoStack/server/.env' });
const mongoose = require('mongoose');
const Note = require('f:/Build/MemoStack/server/src/models/Note');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const count = await Note.countDocuments({ deletedAt: null });
  console.log('Total undeleted notes:', count);
  
  const totalPinned = await Note.countDocuments({ deletedAt: null, isPinned: true });
  console.log('Total pinned:', totalPinned);

  const query = { deletedAt: null, isArchived: false };
  const countActive = await Note.countDocuments(query);
  console.log('Count active:', countActive);

  process.exit(0);
}
check();
