const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Please specify frequency'],
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastGenerated: {
    type: Date
  },
  nextDueDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate next due date based on frequency
recurringExpenseSchema.methods.calculateNextDueDate = function () {
  const base = this.lastGenerated || this.startDate;
  const next = new Date(base);

  switch (this.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

// Pre-save: auto-calculate nextDueDate
recurringExpenseSchema.pre('save', function (next) {
  if (!this.nextDueDate || this.isModified('frequency') || this.isModified('startDate') || this.isModified('lastGenerated')) {
    this.nextDueDate = this.calculateNextDueDate();
  }
  next();
});

recurringExpenseSchema.index({ userId: 1, isActive: 1 });
recurringExpenseSchema.index({ nextDueDate: 1, isActive: 1 });

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
