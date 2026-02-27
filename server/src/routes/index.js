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

// Mount routes
router.use('/folders', folderRoutes);
router.use('/notes', noteRoutes);

module.exports = router;
