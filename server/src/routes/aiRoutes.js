const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares');

router.post('/format', protect, aiController.formatText);
router.post('/summarize', protect, aiController.summarizeNote);
router.post('/chat', protect, aiController.chat);
router.post('/search', protect, aiController.semanticSearch);

module.exports = router;
