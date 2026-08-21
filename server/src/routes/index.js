const express = require('express');
const folderRoutes = require('./folderRoutes');
const noteRoutes = require('./noteRoutes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

const authRoutes = require('./authRoutes');
const aiRoutes = require('./aiRoutes');
const { protect } = require('../middlewares');

// Mount routes
router.use('/auth', authRoutes);
router.use('/folders', protect, folderRoutes);
router.use('/notes', protect, noteRoutes);
router.use('/ai', protect, aiRoutes);

module.exports = router;
