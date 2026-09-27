const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    required: [true, 'Please specify income source'],
    enum: ['salary', 'freelance', 'business', 'rental', 'investment', 'dividend', 'interest', 'other']
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  frequency: {
    type: String,
    required: [true, 'Please specify frequency'],
    enum: ['one-time', 'monthly', 'quarterly', 'yearly']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual: monthly equivalent
incomeSchema.virtual('monthlyEquivalent').get(function () {
  switch (this.frequency) {
    case 'one-time': return 0;
    case 'monthly': return this.amount;
    case 'quarterly': return this.amount / 3;
    case 'yearly': return this.amount / 12;
    default: return this.amount;
  }
});

incomeSchema.set('toJSON', { virtuals: true });
incomeSchema.set('toObject', { virtuals: true });

incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, source: 1 });

module.exports = mongoose.model('Income', incomeSchema);
