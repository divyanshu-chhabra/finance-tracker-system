const mongoose = require('mongoose');

const liabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please specify liability type'],
    enum: ['homeLoan', 'carLoan', 'personalLoan', 'educationLoan', 'creditCard', 'other']
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
  principal: {
    type: Number,
    required: [true, 'Please add principal amount'],
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0
  },
  emi: {
    type: Number,
    default: 0
  },
  tenure: {
    type: Number,
    default: 0,
    // in months
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Number,
    default: 1,
    // day of the month
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for total payable
liabilitySchema.virtual('totalPayable').get(function() {
  return this.emi * this.tenure;
});

// Virtual for total interest
liabilitySchema.virtual('totalInterest').get(function() {
  return (this.emi * this.tenure) - this.principal;
});

// Virtual for months remaining
liabilitySchema.virtual('monthsRemaining').get(function() {
  if (this.emi === 0) return 0;
  return Math.ceil(this.outstandingBalance / this.emi);
});

liabilitySchema.set('toJSON', { virtuals: true });
liabilitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Liability', liabilitySchema);
