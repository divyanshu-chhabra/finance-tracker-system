const express = require('express');
const router = express.Router();
const { getIncomes, createIncome, updateIncome, deleteIncome, getIncomeSummary } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getIncomes).post(protect, createIncome);
router.get('/summary', protect, getIncomeSummary);
router.route('/:id').put(protect, updateIncome).delete(protect, deleteIncome);

module.exports = router;
