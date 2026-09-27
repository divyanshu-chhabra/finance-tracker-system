import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { aiAPI, budgetAlertsAPI } from '../../services/api';
import { formatCurrency, CHART_COLORS, EXPENSE_CATEGORIES, ALERT_SEVERITY } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const now = new Date();
      const [dashData, analysisData, alertsData] = await Promise.all([
        aiAPI.getDashboard(),
        aiAPI.analyze(),
        budgetAlertsAPI.getAlerts(now.getMonth() + 1, now.getFullYear()).catch(() => ({ alerts: [] }))
      ]);
      setData(dashData);
      setAnalysis(analysisData);
      setBudgetAlerts(alertsData.alerts || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="auth-spinner" style={{ width: 40, height: 40 }}></div>
          <p>Loading your financial overview...</p>
        </div>
      </div>
    );
  }

  const assetAllocationData = analysis?.assetAllocation
    ? Object.entries(analysis.assetAllocation).map(([name, value]) => ({ name, value }))
    : [];

  const spendingData = analysis?.topSpendingCategories || [];

  const healthColor = analysis?.healthScore >= 70 ? 'var(--success-400)' 
    : analysis?.healthScore >= 40 ? 'var(--warning-400)' 
    : 'var(--danger-400)';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your financial overview</p>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="budget-alerts-banner">
          <div className="budget-alerts-header">
            <h3 className="budget-alerts-title">🔔 Budget Alerts</h3>
            <Link to="/expenses" className="btn btn-ghost btn-sm">Manage Budgets →</Link>
          </div>
          <div className="budget-alerts-list">
            {budgetAlerts.map((alert, i) => (
              <div key={i} className={`budget-alert-item ${alert.severity}`}>
                <div className="budget-alert-left">
                  <span className="budget-alert-icon">
                    {ALERT_SEVERITY[alert.severity]?.icon}
                  </span>
                  <div>
                    <div className="budget-alert-title-text">
                      {EXPENSE_CATEGORIES[alert.category]?.icon} {alert.title}
                    </div>
                    <div className="budget-alert-message">{alert.message}</div>
                  </div>
                </div>
                <div className="budget-alert-progress-wrap">
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div
                      className={`progress-bar-fill ${alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warn' : ''}`}
                      style={{ width: `${Math.min(alert.percentUsed, 100)}%` }}
                    ></div>
                  </div>
                  <span className="budget-alert-percent">{alert.percentUsed}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-icon primary">💎</div>
          <div className="stat-card-label">Net Worth</div>
          <div className="stat-card-value">{formatCurrency(data?.netWorth)}</div>
          <div className={`stat-card-change ${data?.netWorth >= 0 ? 'positive' : 'negative'}`}>
            {data?.netWorth >= 0 ? '↑' : '↓'} {data?.assetCount} assets, {data?.liabilityCount} liabilities
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-card-icon accent">💰</div>
          <div className="stat-card-label">Total Assets</div>
          <div className="stat-card-value">{formatCurrency(data?.totalAssets)}</div>
          <div className="stat-card-change positive">
            {data?.assetCount} investments tracked
          </div>
        </div>

        <div className="stat-card warm">
          <div className="stat-card-icon warm">🏦</div>
          <div className="stat-card-label">Total Liabilities</div>
          <div className="stat-card-value">{formatCurrency(data?.totalLiabilities)}</div>
          <div className="stat-card-change negative">
            EMI: {formatCurrency(data?.totalEMI)}/mo
          </div>
        </div>

        <div className="stat-card cool">
          <div className="stat-card-icon cool">📝</div>
          <div className="stat-card-label">Monthly Expenses</div>
          <div className="stat-card-value">{formatCurrency(data?.monthlyExpenses)}</div>
          <div className="stat-card-change">
            {data?.expenseCount} transactions this month
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Financial Health Score */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Financial Health Score</h3>
            <span className="badge badge-primary">{analysis?.grade || 'N/A'}</span>
          </div>
          <div className="health-score-container">
            <div className="health-score-circle" style={{ '--score': analysis?.healthScore || 0, '--color': healthColor }}>
              <div className="health-score-inner">
                <span className="health-score-value">{analysis?.healthScore || 0}</span>
                <span className="health-score-label">/ 100</span>
              </div>
            </div>
            <div className="health-metrics">
              <div className="health-metric">
                <span className="health-metric-label">Savings Rate</span>
                <span className="health-metric-value">{analysis?.savingsRate || 0}%</span>
              </div>
              <div className="health-metric">
                <span className="health-metric-label">Debt-to-Income</span>
                <span className="health-metric-value">{analysis?.dtiRatio || 0}%</span>
              </div>
              <div className="health-metric">
                <span className="health-metric-label">Emergency Fund</span>
                <span className="health-metric-value">{analysis?.emergencyMonths || 0} months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Asset Allocation</h3>
            <Link to="/assets" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {assetAllocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={assetAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {assetAllocationData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p className="empty-state-text">Add assets to see allocation</p>
              <Link to="/assets" className="btn btn-primary btn-sm">Add Assets</Link>
            </div>
          )}
          {assetAllocationData.length > 0 && (
            <div className="chart-legend">
              {assetAllocationData.map((item, i) => (
                <div key={i} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                  <span className="chart-legend-label">{item.name}</span>
                  <span className="chart-legend-value">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Spending & Quick Actions */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Top Spending Categories</h3>
            <Link to="/expenses" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {spendingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={spendingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" tickFormatter={(v) => `₹${v}`} stroke="var(--text-tertiary)" />
                <YAxis type="category" dataKey="category" stroke="var(--text-tertiary)" width={90} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Bar dataKey="monthlyAvg" fill="url(#barGradient)" radius={[0, 6, 6, 0]}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4c6ef5" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p className="empty-state-text">No expenses tracked yet</p>
              <Link to="/expenses" className="btn btn-primary btn-sm">Track Expenses</Link>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">AI Insights</h3>
            <Link to="/ai-bot" className="btn btn-ghost btn-sm">Chat →</Link>
          </div>
          <div className="ai-insights-list">
            {analysis?.feedback?.slice(0, 4).map((item, i) => (
              <div key={i} className={`ai-insight-item ${item.type}`}>
                <span className="ai-insight-icon">
                  {item.type === 'positive' ? '✅' : item.type === 'warning' ? '⚠️' : item.type === 'danger' ? '🚨' : 'ℹ️'}
                </span>
                <span className="ai-insight-text">{item.message}</span>
              </div>
            )) || (
              <div className="empty-state">
                <div className="empty-state-icon">🤖</div>
                <p className="empty-state-text">Add financial data for AI insights</p>
              </div>
            )}
          </div>
          {analysis?.tips?.length > 0 && (
            <div className="ai-tips">
              <h4 className="ai-tips-title">💡 Tips</h4>
              {analysis.tips.slice(0, 2).map((tip, i) => (
                <p key={i} className="ai-tip">{tip}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="quick-actions-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/assets" className="quick-action-card">
            <span className="quick-action-icon">💰</span>
            <span className="quick-action-label">Add Asset</span>
          </Link>
          <Link to="/liabilities" className="quick-action-card">
            <span className="quick-action-icon">🏦</span>
            <span className="quick-action-label">Add Liability</span>
          </Link>
          <Link to="/expenses" className="quick-action-card">
            <span className="quick-action-icon">📝</span>
            <span className="quick-action-label">Log Expense</span>
          </Link>
          <Link to="/ai-bot" className="quick-action-card">
            <span className="quick-action-icon">🤖</span>
            <span className="quick-action-label">AI Advisor</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
