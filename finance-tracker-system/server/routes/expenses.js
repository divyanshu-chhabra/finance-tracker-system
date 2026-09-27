const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense, getBudgets, setBudget, exportExpenses, getBudgetAlerts } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getExpenses).post(protect, createExpense);
router.get('/export', protect, exportExpenses);
router.get('/budget-alerts', protect, getBudgetAlerts);
router.route('/budgets').get(protect, getBudgets).post(protect, setBudget);
router.route('/:id').put(protect, updateExpense).delete(protect, deleteExpense);

module.exports = router;

