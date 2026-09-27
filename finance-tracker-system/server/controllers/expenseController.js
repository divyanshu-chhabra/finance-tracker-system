const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @desc    Get expenses (with optional date filters)
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, month, year } = req.query;
    const filter = { userId: req.user._id };

    if (category) filter.category = category;

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    // Category-wise summary
    const categoryTotals = {};
    let totalAmount = 0;
    expenses.forEach(exp => {
      totalAmount += exp.amount;
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = 0;
      }
      categoryTotals[exp.category] += exp.amount;
    });

    // Daily totals
    const dailyTotals = {};
    expenses.forEach(exp => {
      const dateKey = exp.date.toISOString().split('T')[0];
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = 0;
      }
      dailyTotals[dateKey] += exp.amount;
    });

    res.json({
      expenses,
      summary: {
        totalAmount,
        categoryTotals,
        dailyTotals,
        count: expenses.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    Object.assign(expense, req.body);
    const updated = await expense.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get budgets for a month
// @route   GET /api/expenses/budgets
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const budgets = await Budget.find({ userId: req.user._id, month: m, year: y });

    // Get actual expenses for the same month
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const expenses = await Expense.find({ userId: req.user._id, date: { $gte: start, $lte: end } });

    const categorySpent = {};
    expenses.forEach(exp => {
      if (!categorySpent[exp.category]) categorySpent[exp.category] = 0;
      categorySpent[exp.category] += exp.amount;
    });

    const budgetData = budgets.map(b => ({
      ...b.toJSON(),
      spent: categorySpent[b.category] || 0,
      remaining: b.monthlyLimit - (categorySpent[b.category] || 0),
      percentUsed: ((categorySpent[b.category] || 0) / b.monthlyLimit) * 100
    }));

    res.json(budgetData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set/Update budget
// @route   POST /api/expenses/budgets
const setBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month: m, year: y },
      { monthlyLimit },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getBudgets, setBudget };
