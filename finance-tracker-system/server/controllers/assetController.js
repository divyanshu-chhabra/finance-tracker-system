const Asset = require('../models/Asset');

// @desc    Get all assets for user
// @route   GET /api/assets
const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    // Calculate summary
    const summary = {
      totalInvested: 0,
      totalCurrentValue: 0,
      totalProfit: 0,
      byType: {}
    };

    assets.forEach(asset => {
      const invested = asset.type === 'stock' || asset.type === 'mutualFund' || asset.type === 'crypto' 
        ? asset.buyPrice * asset.quantity 
        : asset.amount;
      const current = asset.type === 'stock' || asset.type === 'mutualFund' || asset.type === 'crypto'
        ? asset.currentPrice * asset.quantity
        : asset.currentValue || asset.amount;

      summary.totalInvested += invested;
      summary.totalCurrentValue += current;

      if (!summary.byType[asset.type]) {
        summary.byType[asset.type] = { invested: 0, currentValue: 0, count: 0 };
      }
      summary.byType[asset.type].invested += invested;
      summary.byType[asset.type].currentValue += current;
      summary.byType[asset.type].count += 1;
    });

    summary.totalProfit = summary.totalCurrentValue - summary.totalInvested;

    res.json({ assets, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new asset
// @route   POST /api/assets
const createAsset = async (req, res) => {
  try {
    const asset = await Asset.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    Object.assign(asset, req.body);
    const updated = await asset.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssets, createAsset, updateAsset, deleteAsset };
