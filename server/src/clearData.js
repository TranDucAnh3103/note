require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { Folder, Note } = require('./models');

const clearAllData = async () => {
  try {
    await connectDB();

    console.log('🗑️ Đang xóa tất cả dữ liệu...');

    const [deletedNotes, deletedFolders] = await Promise.all([
      Note.deleteMany({}),
      Folder.deleteMany({})
    ]);

    console.log(`✅ Đã xóa ${deletedNotes.deletedCount} ghi chú`);
    console.log(`✅ Đã xóa ${deletedFolders.deletedCount} thư mục`);
    console.log('🎉 Hoàn tất! Tất cả dữ liệu đã được xóa.');

    await mongoose.connection.close();
    console.log('📴 Đã đóng kết nối database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu:', error);
    process.exit(1);
  }
};

clearAllData();
