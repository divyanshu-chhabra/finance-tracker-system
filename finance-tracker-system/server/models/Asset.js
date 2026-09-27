const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please specify asset type'],
    enum: ['savings', 'fd', 'stock', 'mutualFund', 'gold', 'crypto', 'ppf', 'nps', 'other']
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  institution: {
    type: String,
    trim: true,
    default: ''
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: {
    type: Date
  },
  quantity: {
    type: Number,
    default: 0
  },
  buyPrice: {
    type: Number,
    default: 0
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for profit/loss
assetSchema.virtual('profitLoss').get(function() {
  if (this.type === 'stock' || this.type === 'mutualFund' || this.type === 'crypto') {
    return (this.currentPrice - this.buyPrice) * this.quantity;
  }
  return this.currentValue - this.amount;
});

// Virtual for return percentage
assetSchema.virtual('returnPercent').get(function() {
  if (this.type === 'stock' || this.type === 'mutualFund' || this.type === 'crypto') {
    if (this.buyPrice === 0) return 0;
    return ((this.currentPrice - this.buyPrice) / this.buyPrice) * 100;
  }
  if (this.amount === 0) return 0;
  return ((this.currentValue - this.amount) / this.amount) * 100;
});

assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Asset', assetSchema);
