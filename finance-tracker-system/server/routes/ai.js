const express = require('express');
const router = express.Router();
const { analyzeFinances, chat, getDashboard } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/analyze', protect, analyzeFinances);
router.post('/chat', protect, chat);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
