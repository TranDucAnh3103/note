require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { Folder, Note } = require('./models');

// 7 folder chuẩn mặc định
const DEFAULT_FOLDERS = [
  { name: 'Công việc', color: '#ef4444', icon: 'briefcase', order: 0 },
  { name: 'Cá nhân', color: '#3b82f6', icon: 'user', order: 1 },
  { name: 'Học tập', color: '#8b5cf6', icon: 'graduation-cap', order: 2 },
  { name: 'Dự án', color: '#22c55e', icon: 'folder-kanban', order: 3 },
  { name: 'Ý tưởng', color: '#eab308', icon: 'lightbulb', order: 4 },
  { name: 'Tài chính', color: '#f97316', icon: 'wallet', order: 5 },
  { name: 'Khác', color: '#6b7280', icon: 'folder', order: 6 },
];

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

    console.log('📁 Đang tạo 7 folder mặc định...');
    const folders = await Folder.insertMany(DEFAULT_FOLDERS);
    console.log(`✅ Đã tạo ${folders.length} folder mặc định`);

    console.log('🎉 Hoàn tất! Dữ liệu đã được reset với 7 folder chuẩn.');

    await mongoose.connection.close();
    console.log('📴 Đã đóng kết nối database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu:', error);
    process.exit(1);
  }
};

clearAllData();
