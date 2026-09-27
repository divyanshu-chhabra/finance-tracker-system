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

// @desc    Export expenses as CSV
// @route   GET /api/expenses/export
const exportExpenses = async (req, res) => {
  try {
    const { startDate, endDate, month, year, format } = req.query;
    const filter = { userId: req.user._id };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    // CSV format
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Notes'];
    const csvRows = [headers.join(',')];

    expenses.forEach(exp => {
      const row = [
        new Date(exp.date).toISOString().split('T')[0],
        exp.category,
        `"${(exp.description || '').replace(/"/g, '""')}"`,
        exp.amount,
        `"${(exp.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    // Summary rows
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    csvRows.push('');
    csvRows.push(`Total,,,"${total}",`);
    csvRows.push(`Transaction Count,,,"${expenses.length}",`);

    const csvContent = csvRows.join('\n');

    if (format === 'json') {
      // Return data as JSON for client-side PDF generation
      const categoryTotals = {};
      expenses.forEach(e => {
        if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
        categoryTotals[e.category] += e.amount;
      });

      return res.json({
        expenses: expenses.map(e => ({
          date: new Date(e.date).toISOString().split('T')[0],
          category: e.category,
          description: e.description,
          amount: e.amount,
          notes: e.notes || ''
        })),
        summary: { total, count: expenses.length, categoryTotals }
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses_${month || 'all'}_${year || 'all'}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get budget alerts (categories near or over limit)
// @route   GET /api/expenses/budget-alerts
const getBudgetAlerts = async (req, res) => {
  try {
    const m = parseInt(req.query.month) || new Date().getMonth() + 1;
    const y = parseInt(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({ userId: req.user._id, month: m, year: y });

    if (budgets.length === 0) {
      return res.json({ alerts: [], message: 'No budgets set for this month' });
    }

    // Get actual expenses
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const expenses = await Expense.find({ userId: req.user._id, date: { $gte: start, $lte: end } });

    const categorySpent = {};
    expenses.forEach(exp => {
      if (!categorySpent[exp.category]) categorySpent[exp.category] = 0;
      categorySpent[exp.category] += exp.amount;
    });

    const alerts = [];

    budgets.forEach(budget => {
      const spent = categorySpent[budget.category] || 0;
      const percentUsed = (spent / budget.monthlyLimit) * 100;
      const remaining = budget.monthlyLimit - spent;

      if (percentUsed >= 100) {
        alerts.push({
          category: budget.category,
          severity: 'danger',
          title: 'Budget Exceeded!',
          message: `You've exceeded your ${budget.category} budget by ₹${Math.abs(remaining).toLocaleString('en-IN')}`,
          percentUsed: Math.round(percentUsed),
          spent,
          limit: budget.monthlyLimit,
          overspent: Math.abs(remaining)
        });
      } else if (percentUsed >= 80) {
        alerts.push({
          category: budget.category,
          severity: 'warning',
          title: 'Approaching Limit',
          message: `${budget.category} spending is at ${Math.round(percentUsed)}% of budget. Only ₹${remaining.toLocaleString('en-IN')} left`,
          percentUsed: Math.round(percentUsed),
          spent,
          limit: budget.monthlyLimit,
          remaining
        });
      } else if (percentUsed >= 60) {
        alerts.push({
          category: budget.category,
          severity: 'info',
          title: 'Moderate Spending',
          message: `${budget.category} is at ${Math.round(percentUsed)}% of budget`,
          percentUsed: Math.round(percentUsed),
          spent,
          limit: budget.monthlyLimit,
          remaining
        });
      }
    });

    // Sort by severity
    const severityOrder = { danger: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    res.json({ alerts, month: m, year: y });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getBudgets, setBudget, exportExpenses, getBudgetAlerts };
