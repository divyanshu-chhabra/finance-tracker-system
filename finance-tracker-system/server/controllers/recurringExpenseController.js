const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');

// @desc    Get all recurring expenses for user
// @route   GET /api/recurring-expenses
const getRecurringExpenses = async (req, res) => {
  try {
    const recurringExpenses = await RecurringExpense.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Calculate summary
    let totalMonthly = 0;
    let totalYearly = 0;
    let activeCount = 0;

    recurringExpenses.forEach(re => {
      if (!re.isActive) return;
      activeCount++;
      switch (re.frequency) {
        case 'daily': totalMonthly += re.amount * 30; break;
        case 'weekly': totalMonthly += re.amount * 4.33; break;
        case 'monthly': totalMonthly += re.amount; break;
        case 'yearly': totalMonthly += re.amount / 12; break;
      }
    });
    totalYearly = totalMonthly * 12;

    res.json({
      recurringExpenses,
      summary: {
        totalMonthly: Math.round(totalMonthly),
        totalYearly: Math.round(totalYearly),
        activeCount,
        totalCount: recurringExpenses.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new recurring expense
// @route   POST /api/recurring-expenses
const createRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(recurringExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update recurring expense
// @route   PUT /api/recurring-expenses/:id
const updateRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    Object.assign(recurringExpense, req.body);
    const updated = await recurringExpense.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete recurring expense
// @route   DELETE /api/recurring-expenses/:id
const deleteRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }
    res.json({ message: 'Recurring expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle active status
// @route   PATCH /api/recurring-expenses/:id/toggle
const toggleRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    recurringExpense.isActive = !recurringExpense.isActive;
    const updated = await recurringExpense.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate pending expenses from recurring (run on demand or via cron)
// @route   POST /api/recurring-expenses/generate
const generatePendingExpenses = async (req, res) => {
  try {
    const now = new Date();
    const recurringExpenses = await RecurringExpense.find({
      userId: req.user._id,
      isActive: true,
      nextDueDate: { $lte: now }
    });

    const generated = [];

    for (const re of recurringExpenses) {
      // Don't generate if past endDate
      if (re.endDate && now > re.endDate) {
        re.isActive = false;
        await re.save();
        continue;
      }

      // Create the expense
      const expense = await Expense.create({
        userId: re.userId,
        category: re.category,
        amount: re.amount,
        date: re.nextDueDate,
        description: `[Recurring] ${re.description}`,
        notes: re.notes || `Auto-generated from recurring: ${re.description}`
      });

      // Update recurring record
      re.lastGenerated = re.nextDueDate;
      await re.save(); // pre-save hook recalculates nextDueDate

      generated.push(expense);
    }

    res.json({
      message: `Generated ${generated.length} expense(s) from recurring`,
      generated,
      count: generated.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
  generatePendingExpenses
};
