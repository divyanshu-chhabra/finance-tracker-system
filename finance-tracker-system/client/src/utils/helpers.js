// Format currency in Indian format
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format percentage
export const formatPercent = (value) => {
  if (!value && value !== 0) return '0%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Category labels
export const ASSET_TYPES = {
  savings: { label: 'Savings Account', icon: '🏦', color: '#4c6ef5' },
  fd: { label: 'Fixed Deposit', icon: '📋', color: '#10b981' },
  stock: { label: 'Stocks', icon: '📈', color: '#f59e0b' },
  mutualFund: { label: 'Mutual Funds', icon: '📊', color: '#8b5cf6' },
  gold: { label: 'Gold', icon: '🥇', color: '#eab308' },
  crypto: { label: 'Crypto', icon: '₿', color: '#f97316' },
  ppf: { label: 'PPF', icon: '🏛️', color: '#06b6d4' },
  nps: { label: 'NPS', icon: '🎯', color: '#ec4899' },
  other: { label: 'Other', icon: '💼', color: '#64748b' }
};

export const LIABILITY_TYPES = {
  homeLoan: { label: 'Home Loan', icon: '🏠', color: '#4c6ef5' },
  carLoan: { label: 'Car Loan', icon: '🚗', color: '#10b981' },
  personalLoan: { label: 'Personal Loan', icon: '💳', color: '#f59e0b' },
  educationLoan: { label: 'Education Loan', icon: '🎓', color: '#8b5cf6' },
  creditCard: { label: 'Credit Card', icon: '💳', color: '#f43f5e' },
  other: { label: 'Other', icon: '📄', color: '#64748b' }
};

export const EXPENSE_CATEGORIES = {
  food: { label: 'Food & Dining', icon: '🍕', color: '#f59e0b' },
  transport: { label: 'Transport', icon: '🚕', color: '#3b82f6' },
  utilities: { label: 'Utilities', icon: '💡', color: '#10b981' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#ec4899' },
  health: { label: 'Health', icon: '🏥', color: '#ef4444' },
  education: { label: 'Education', icon: '📚', color: '#06b6d4' },
  rent: { label: 'Rent', icon: '🏘️', color: '#f97316' },
  groceries: { label: 'Groceries', icon: '🛒', color: '#22c55e' },
  other: { label: 'Other', icon: '📦', color: '#64748b' }
};

// Chart colors
export const CHART_COLORS = [
  '#4c6ef5', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e',
  '#06b6d4', '#ec4899', '#f97316', '#22c55e', '#64748b'
];

// Income source types
export const INCOME_SOURCES = {
  salary: { label: 'Salary', icon: '💼', color: '#4c6ef5' },
  freelance: { label: 'Freelance', icon: '💻', color: '#10b981' },
  business: { label: 'Business', icon: '🏢', color: '#f59e0b' },
  rental: { label: 'Rental', icon: '🏠', color: '#8b5cf6' },
  investment: { label: 'Investment', icon: '📈', color: '#06b6d4' },
  dividend: { label: 'Dividend', icon: '💹', color: '#ec4899' },
  interest: { label: 'Interest', icon: '🏦', color: '#22c55e' },
  other: { label: 'Other', icon: '📦', color: '#64748b' }
};

// Recurring frequency labels
export const FREQUENCY_LABELS = {
  daily: { label: 'Daily', short: '/day' },
  weekly: { label: 'Weekly', short: '/week' },
  monthly: { label: 'Monthly', short: '/mo' },
  yearly: { label: 'Yearly', short: '/yr' },
  'one-time': { label: 'One-time', short: '' },
  quarterly: { label: 'Quarterly', short: '/qtr' }
};

// Alert severity config
export const ALERT_SEVERITY = {
  danger: { label: 'Critical', icon: '🚨', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
  warning: { label: 'Warning', icon: '⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  info: { label: 'Info', icon: 'ℹ️', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)' }
};

