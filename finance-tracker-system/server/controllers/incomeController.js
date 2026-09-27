const Income = require('../models/Income');

// @desc    Get all income entries for user
// @route   GET /api/income
const getIncomes = async (req, res) => {
  try {
    const { startDate, endDate, source, month, year } = req.query;
    const filter = { userId: req.user._id };

    if (source) filter.source = source;

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const incomes = await Income.find(filter).sort({ date: -1 });

    // Summary calculations
    let totalAmount = 0;
    let totalMonthlyRecurring = 0;
    const sourceTotals = {};

    incomes.forEach(inc => {
      totalAmount += inc.amount;
      if (inc.isRecurring && inc.isActive) {
        totalMonthlyRecurring += inc.monthlyEquivalent;
      }
      if (!sourceTotals[inc.source]) sourceTotals[inc.source] = 0;
      sourceTotals[inc.source] += inc.amount;
    });

    res.json({
      incomes,
      summary: {
        totalAmount,
        totalMonthlyRecurring: Math.round(totalMonthlyRecurring),
        sourceTotals,
        count: incomes.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new income
// @route   POST /api/income
const createIncome = async (req, res) => {
  try {
    const income = await Income.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    Object.assign(income, req.body);
    const updated = await income.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json({ message: 'Income removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get income summary (total monthly income from all recurring sources)
// @route   GET /api/income/summary
const getIncomeSummary = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id, isRecurring: true, isActive: true });

    let totalMonthly = 0;
    const sourceBreakdown = {};

    incomes.forEach(inc => {
      const monthly = inc.monthlyEquivalent;
      totalMonthly += monthly;
      if (!sourceBreakdown[inc.source]) {
        sourceBreakdown[inc.source] = { monthly: 0, count: 0, items: [] };
      }
      sourceBreakdown[inc.source].monthly += monthly;
      sourceBreakdown[inc.source].count += 1;
      sourceBreakdown[inc.source].items.push({ name: inc.name, amount: inc.amount, frequency: inc.frequency });
    });

    res.json({
      totalMonthlyIncome: Math.round(totalMonthly),
      totalYearlyIncome: Math.round(totalMonthly * 12),
      sourceBreakdown,
      activeStreams: incomes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getIncomes, createIncome, updateIncome, deleteIncome, getIncomeSummary };
