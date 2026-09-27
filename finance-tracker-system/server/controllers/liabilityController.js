const Liability = require('../models/Liability');

// @desc    Get all liabilities for user
// @route   GET /api/liabilities
const getLiabilities = async (req, res) => {
  try {
    const liabilities = await Liability.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const summary = {
      totalPrincipal: 0,
      totalOutstanding: 0,
      totalEMI: 0,
      totalInterest: 0,
      byType: {}
    };

    liabilities.forEach(liability => {
      summary.totalPrincipal += liability.principal;
      summary.totalOutstanding += liability.outstandingBalance;
      summary.totalEMI += liability.emi;
      summary.totalInterest += liability.totalInterest || 0;

      if (!summary.byType[liability.type]) {
        summary.byType[liability.type] = { principal: 0, outstanding: 0, emi: 0, count: 0 };
      }
      summary.byType[liability.type].principal += liability.principal;
      summary.byType[liability.type].outstanding += liability.outstandingBalance;
      summary.byType[liability.type].emi += liability.emi;
      summary.byType[liability.type].count += 1;
    });

    res.json({ liabilities, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new liability
// @route   POST /api/liabilities
const createLiability = async (req, res) => {
  try {
    const liability = await Liability.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(liability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update liability
// @route   PUT /api/liabilities/:id
const updateLiability = async (req, res) => {
  try {
    const liability = await Liability.findOne({ _id: req.params.id, userId: req.user._id });
    if (!liability) {
      return res.status(404).json({ message: 'Liability not found' });
    }

    Object.assign(liability, req.body);
    const updated = await liability.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete liability
// @route   DELETE /api/liabilities/:id
const deleteLiability = async (req, res) => {
  try {
    const liability = await Liability.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!liability) {
      return res.status(404).json({ message: 'Liability not found' });
    }
    res.json({ message: 'Liability removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLiabilities, createLiability, updateLiability, deleteLiability };
