const express = require('express');
const router = express.Router();
const {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
  generatePendingExpenses
} = require('../controllers/recurringExpenseController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getRecurringExpenses).post(protect, createRecurringExpense);
router.post('/generate', protect, generatePendingExpenses);
router.route('/:id').put(protect, updateRecurringExpense).delete(protect, deleteRecurringExpense);
router.patch('/:id/toggle', protect, toggleRecurringExpense);

module.exports = router;
