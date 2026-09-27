const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['food', 'transport', 'utilities', 'entertainment', 'shopping', 'health', 'education', 'rent', 'groceries', 'other']
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Please set a monthly limit']
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
