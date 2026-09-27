const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense, getBudgets, setBudget } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getExpenses).post(protect, createExpense);
router.route('/budgets').get(protect, getBudgets).post(protect, setBudget);
router.route('/:id').put(protect, updateExpense).delete(protect, deleteExpense);

module.exports = router;
