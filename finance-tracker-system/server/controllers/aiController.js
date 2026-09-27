const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get AI financial analysis
// @route   GET /api/ai/analyze
const analyzeFinances = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Fetch all financial data
    const assets = await Asset.find({ userId });
    const liabilities = await Liability.find({ userId });

    // Get last 3 months of expenses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const expenses = await Expense.find({ userId, date: { $gte: threeMonthsAgo } });

    // Calculate totals
    let totalAssets = 0;
    assets.forEach(a => {
      if (a.type === 'stock' || a.type === 'mutualFund' || a.type === 'crypto') {
        totalAssets += a.currentPrice * a.quantity;
      } else {
        totalAssets += a.currentValue || a.amount;
      }
    });

    let totalLiabilities = 0;
    let totalEMI = 0;
    liabilities.forEach(l => {
      totalLiabilities += l.outstandingBalance;
      totalEMI += l.emi;
    });

    const netWorth = totalAssets - totalLiabilities;

    // Monthly expenses average
    const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) / 3;

    // Category-wise expense breakdown
    const categorySpending = {};
    expenses.forEach(e => {
      if (!categorySpending[e.category]) categorySpending[e.category] = 0;
      categorySpending[e.category] += e.amount;
    });

    // Asset diversification
    const assetTypes = {};
    assets.forEach(a => {
      if (!assetTypes[a.type]) assetTypes[a.type] = 0;
      if (a.type === 'stock' || a.type === 'mutualFund' || a.type === 'crypto') {
        assetTypes[a.type] += a.currentPrice * a.quantity;
      } else {
        assetTypes[a.type] += a.currentValue || a.amount;
      }
    });

    // Generate financial health score (0-100)
    let healthScore = 50;
    const feedback = [];
    const tips = [];

    // 1. Savings Rate Analysis
    const monthlyIncome = user.monthlyIncome || 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    if (savingsRate >= 30) {
      healthScore += 15;
      feedback.push({ type: 'positive', message: `Excellent savings rate of ${savingsRate.toFixed(1)}%! You're saving more than the recommended 20%.` });
    } else if (savingsRate >= 20) {
      healthScore += 10;
      feedback.push({ type: 'positive', message: `Good savings rate of ${savingsRate.toFixed(1)}%. You're meeting the minimum recommended savings.` });
    } else if (savingsRate >= 0) {
      healthScore -= 5;
      feedback.push({ type: 'warning', message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income.` });
      tips.push('Set up automatic transfers to a savings account on payday.');
    } else {
      healthScore -= 15;
      feedback.push({ type: 'danger', message: `You're spending more than you earn! Your savings rate is ${savingsRate.toFixed(1)}%.` });
      tips.push('Immediately review your expenses and cut non-essential spending.');
    }

    // 2. Debt-to-Income Ratio
    const dtiRatio = monthlyIncome > 0 ? (totalEMI / monthlyIncome) * 100 : 0;
    if (dtiRatio === 0 && liabilities.length === 0) {
      healthScore += 10;
      feedback.push({ type: 'positive', message: 'Debt-free! Great financial discipline.' });
    } else if (dtiRatio <= 30) {
      healthScore += 5;
      feedback.push({ type: 'positive', message: `Healthy debt-to-income ratio of ${dtiRatio.toFixed(1)}%.` });
    } else if (dtiRatio <= 50) {
      healthScore -= 5;
      feedback.push({ type: 'warning', message: `Your debt-to-income ratio is ${dtiRatio.toFixed(1)}%. Consider paying off high-interest debt first.` });
      tips.push('Use the avalanche method: pay off highest interest rate loans first.');
    } else {
      healthScore -= 15;
      feedback.push({ type: 'danger', message: `High debt-to-income ratio of ${dtiRatio.toFixed(1)}%! This is above the safe threshold.` });
      tips.push('Consider debt consolidation or speak with a financial advisor.');
    }

    // 3. Investment Diversification
    const assetTypeCount = Object.keys(assetTypes).length;
    if (assetTypeCount >= 4) {
      healthScore += 10;
      feedback.push({ type: 'positive', message: `Well-diversified portfolio across ${assetTypeCount} asset types.` });
    } else if (assetTypeCount >= 2) {
      healthScore += 5;
      feedback.push({ type: 'info', message: `Portfolio spread across ${assetTypeCount} asset types. Consider diversifying more.` });
      tips.push('Consider adding mutual funds or gold to diversify your portfolio.');
    } else if (assetTypeCount === 1) {
      healthScore -= 5;
      feedback.push({ type: 'warning', message: 'Your investments are concentrated in a single asset type. Diversification reduces risk.' });
      tips.push('Don\'t put all eggs in one basket. Spread investments across stocks, FDs, and mutual funds.');
    } else {
      feedback.push({ type: 'info', message: 'No investments found. Start investing to grow your wealth.' });
      tips.push('Begin with low-risk options like Fixed Deposits or PPF, then gradually explore mutual funds.');
    }

    // 4. Emergency Fund Check
    const savingsAssets = assets.filter(a => a.type === 'savings');
    const totalSavings = savingsAssets.reduce((sum, a) => sum + (a.currentValue || a.amount), 0);
    const emergencyMonths = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0;

    if (emergencyMonths >= 6) {
      healthScore += 10;
      feedback.push({ type: 'positive', message: `Strong emergency fund covering ${emergencyMonths.toFixed(1)} months of expenses.` });
    } else if (emergencyMonths >= 3) {
      healthScore += 5;
      feedback.push({ type: 'info', message: `Emergency fund covers ${emergencyMonths.toFixed(1)} months. Aim for 6 months.` });
    } else {
      healthScore -= 5;
      feedback.push({ type: 'warning', message: `Emergency fund only covers ${emergencyMonths.toFixed(1)} months. Build it up to 6 months.` });
      tips.push('Prioritize building an emergency fund of 6 months of expenses before aggressive investing.');
    }

    // 5. Top spending categories
    const sortedCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      const topPercent = (topCategory[1] / (monthlyExpenses * 3) * 100).toFixed(1);
      feedback.push({
        type: 'info',
        message: `Your highest spending category is "${topCategory[0]}" at ${topPercent}% of total expenses (₹${(topCategory[1] / 3).toFixed(0)}/month).`
      });
    }

    // Net Worth analysis
    if (netWorth > 0) {
      healthScore += 5;
      feedback.push({ type: 'positive', message: `Positive net worth of ₹${netWorth.toLocaleString('en-IN')}. Keep growing!` });
    } else if (netWorth < 0) {
      healthScore -= 10;
      feedback.push({ type: 'danger', message: `Negative net worth of ₹${netWorth.toLocaleString('en-IN')}. Focus on reducing liabilities.` });
    }

    // Clamp health score
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Determine overall grade
    let grade;
    if (healthScore >= 80) grade = 'A';
    else if (healthScore >= 60) grade = 'B';
    else if (healthScore >= 40) grade = 'C';
    else if (healthScore >= 20) grade = 'D';
    else grade = 'F';

    res.json({
      healthScore,
      grade,
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses: Math.round(monthlyExpenses),
      savingsRate: Math.round(savingsRate * 10) / 10,
      dtiRatio: Math.round(dtiRatio * 10) / 10,
      emergencyMonths: Math.round(emergencyMonths * 10) / 10,
      feedback,
      tips,
      assetAllocation: assetTypes,
      topSpendingCategories: sortedCategories.map(([category, amount]) => ({
        category,
        monthlyAvg: Math.round(amount / 3)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with AI bot
// @route   POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Fetch user data for context
    const user = await User.findById(userId);
    const assets = await Asset.find({ userId });
    const liabilities = await Liability.find({ userId });

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const expenses = await Expense.find({ userId, date: { $gte: threeMonthsAgo } });

    let totalAssets = 0;
    assets.forEach(a => {
      if (a.type === 'stock' || a.type === 'mutualFund' || a.type === 'crypto') {
        totalAssets += a.currentPrice * a.quantity;
      } else {
        totalAssets += a.currentValue || a.amount;
      }
    });

    let totalLiabilities = 0;
    liabilities.forEach(l => { totalLiabilities += l.outstandingBalance; });
    const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) / 3;

    // Smart response based on keywords
    const msg = message.toLowerCase();
    let response = '';

    if (msg.includes('net worth') || msg.includes('networth')) {
      const nw = totalAssets - totalLiabilities;
      response = `Your current net worth is ₹${nw.toLocaleString('en-IN')}. (Total Assets: ₹${totalAssets.toLocaleString('en-IN')} - Total Liabilities: ₹${totalLiabilities.toLocaleString('en-IN')}). ${nw > 0 ? 'You\'re in a positive position!' : 'Focus on reducing your liabilities to improve this.'}`;
    } else if (msg.includes('save') || msg.includes('saving')) {
      const savingsRate = user.monthlyIncome > 0 ? ((user.monthlyIncome - monthlyExpenses) / user.monthlyIncome * 100) : 0;
      response = `Based on your monthly income of ₹${user.monthlyIncome?.toLocaleString('en-IN')} and average monthly expenses of ₹${Math.round(monthlyExpenses).toLocaleString('en-IN')}, your savings rate is ${savingsRate.toFixed(1)}%. ${savingsRate >= 20 ? 'Great job! You\'re meeting the recommended 20% threshold.' : 'I recommend trying to save at least 20% of your income. Consider automating your savings.'}`;
    } else if (msg.includes('invest') || msg.includes('stock') || msg.includes('mutual fund')) {
      const stockAssets = assets.filter(a => a.type === 'stock' || a.type === 'mutualFund');
      if (stockAssets.length > 0) {
        const totalInvested = stockAssets.reduce((s, a) => s + a.buyPrice * a.quantity, 0);
        const totalCurrent = stockAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0);
        const pl = totalCurrent - totalInvested;
        response = `You have ${stockAssets.length} investments in stocks/mutual funds. Total invested: ₹${totalInvested.toLocaleString('en-IN')}, Current value: ₹${totalCurrent.toLocaleString('en-IN')}, P&L: ₹${pl.toLocaleString('en-IN')} (${(pl/totalInvested*100).toFixed(1)}%).`;
      } else {
        response = 'You don\'t have any stock or mutual fund investments yet. I recommend starting with index funds or diversified mutual funds for long-term wealth building.';
      }
    } else if (msg.includes('loan') || msg.includes('debt') || msg.includes('emi')) {
      if (liabilities.length > 0) {
        const totalEMI = liabilities.reduce((s, l) => s + l.emi, 0);
        response = `You have ${liabilities.length} active loans/liabilities with a total EMI of ₹${totalEMI.toLocaleString('en-IN')}/month and outstanding balance of ₹${totalLiabilities.toLocaleString('en-IN')}. ${user.monthlyIncome > 0 ? `This is ${(totalEMI/user.monthlyIncome*100).toFixed(1)}% of your income.` : ''} Consider paying off high-interest loans first using the avalanche method.`;
      } else {
        response = 'You\'re debt-free! That\'s a great position to be in. Focus on building your investment portfolio.';
      }
    } else if (msg.includes('expense') || msg.includes('spend') || msg.includes('spending')) {
      const categoryTotals = {};
      expenses.forEach(e => {
        if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
        categoryTotals[e.category] += e.amount;
      });
      const topCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);
      response = `Your average monthly spending is ₹${Math.round(monthlyExpenses).toLocaleString('en-IN')}. Top categories: ${topCats.map(([cat, amt]) => `${cat} (₹${Math.round(amt/3).toLocaleString('en-IN')}/mo)`).join(', ')}. Look for areas where you can cut back to boost savings.`;
    } else if (msg.includes('budget')) {
      response = `Setting a budget is crucial. I recommend the 50/30/20 rule: 50% for needs (₹${Math.round(user.monthlyIncome*0.5).toLocaleString('en-IN')}), 30% for wants (₹${Math.round(user.monthlyIncome*0.3).toLocaleString('en-IN')}), and 20% for savings/investments (₹${Math.round(user.monthlyIncome*0.2).toLocaleString('en-IN')}). Go to the Expenses page to set budgets by category.`;
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      response = `Hello ${user.name}! 👋 I'm your AI financial advisor. Ask me about your net worth, savings, investments, loans, expenses, or budget. I can analyze your financial health and give personalized recommendations!`;
    } else {
      response = `I can help you with financial insights! Try asking me about:\n• Your net worth\n• Savings rate\n• Investment portfolio\n• Loans & EMIs\n• Spending patterns\n• Budget recommendations\n\nWhat would you like to know?`;
    }

    res.json({ message: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/ai/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const assets = await Asset.find({ userId });
    const liabilities = await Liability.find({ userId });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const monthExpenses = await Expense.find({ userId, date: { $gte: start, $lte: end } });

    let totalAssets = 0;
    assets.forEach(a => {
      if (a.type === 'stock' || a.type === 'mutualFund' || a.type === 'crypto') {
        totalAssets += a.currentPrice * a.quantity;
      } else {
        totalAssets += a.currentValue || a.amount;
      }
    });

    let totalLiabilities = 0;
    let totalEMI = 0;
    liabilities.forEach(l => {
      totalLiabilities += l.outstandingBalance;
      totalEMI += l.emi;
    });

    const totalMonthExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      netWorth: totalAssets - totalLiabilities,
      totalAssets,
      totalLiabilities,
      monthlyExpenses: totalMonthExpenses,
      totalEMI,
      monthlyIncome: user.monthlyIncome || 0,
      assetCount: assets.length,
      liabilityCount: liabilities.length,
      expenseCount: monthExpenses.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeFinances, chat, getDashboard };
