import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { expensesAPI } from '../../services/api';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, CHART_COLORS } from '../../utils/helpers';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [formData, setFormData] = useState({
    category: 'food', amount: '', date: new Date().toISOString().split('T')[0],
    description: '', notes: ''
  });

  useEffect(() => { loadExpenses(); }, [filter]);

  const loadExpenses = async () => {
    try {
      const data = await expensesAPI.getAll({ month: filter.month, year: filter.year });
      setExpenses(data.expenses);
      setSummary(data.summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      if (editItem) {
        await expensesAPI.update(editItem._id, payload);
      } else {
        await expensesAPI.create(payload);
      }
      setShowModal(false);
      setEditItem(null);
      resetForm();
      loadExpenses();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try { await expensesAPI.delete(id); loadExpenses(); }
      catch (err) { console.error(err); }
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      category: item.category, amount: item.amount,
      date: item.date?.split('T')[0] || '',
      description: item.description, notes: item.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'food', amount: '', date: new Date().toISOString().split('T')[0],
      description: '', notes: ''
    });
  };

  // Chart data
  const categoryData = summary?.categoryTotals
    ? Object.entries(summary.categoryTotals).map(([cat, amount]) => ({
        name: EXPENSE_CATEGORIES[cat]?.label || cat,
        value: amount,
        icon: EXPENSE_CATEGORIES[cat]?.icon || '📦'
      }))
    : [];

  const dailyData = summary?.dailyTotals
    ? Object.entries(summary.dailyTotals)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, amount]) => ({
          date: new Date(date).getDate(),
          amount
        }))
    : [];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="auth-spinner" style={{ width: 40, height: 40 }}></div>
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="page-title">Daily Expenses</h1>
          <p className="page-subtitle">Track every penny, build lasting habits</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 'auto' }} value={filter.month} onChange={e => setFilter({ ...filter, month: Number(e.target.value) })}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={filter.year} onChange={e => setFilter({ ...filter, year: Number(e.target.value) })}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { resetForm(); setEditItem(null); setShowModal(true); }}>
            + Add Expense
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid">
        <div className="stat-card warm">
          <div className="stat-card-icon warm">💸</div>
          <div className="stat-card-label">Total Spent</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalAmount)}</div>
          <div className="stat-card-change">{summary?.count || 0} transactions</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-card-icon primary">📊</div>
          <div className="stat-card-label">Daily Average</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalAmount ? summary.totalAmount / 30 : 0)}</div>
        </div>
        <div className="stat-card cool">
          <div className="stat-card-icon cool">🏷️</div>
          <div className="stat-card-label">Categories Used</div>
          <div className="stat-card-value">{Object.keys(summary?.categoryTotals || {}).length}</div>
        </div>
      </div>

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Spending by Category</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {categoryData.map((item, i) => (
                <div key={i} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                  <span className="chart-legend-label">{item.icon} {item.name}</span>
                  <span className="chart-legend-value">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Daily Spending Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(v) => `₹${v}`} stroke="var(--text-tertiary)" />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="amount" stroke="#4c6ef5" strokeWidth={2} dot={{ fill: '#4c6ef5', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expense List */}
      {expenses.length > 0 ? (
        <div className="expense-list">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Recent Transactions</h3>
            <span className="badge badge-primary">{expenses.length} items</span>
          </div>
          <div className="expense-items">
            {expenses.map(exp => (
              <div key={exp._id} className="expense-item">
                <div className="expense-item-left">
                  <span className="expense-item-icon" style={{ background: `${EXPENSE_CATEGORIES[exp.category]?.color}20` }}>
                    {EXPENSE_CATEGORIES[exp.category]?.icon || '📦'}
                  </span>
                  <div>
                    <div className="expense-item-desc">{exp.description}</div>
                    <div className="expense-item-meta">
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {EXPENSE_CATEGORIES[exp.category]?.label}
                      </span>
                      <span>{formatDate(exp.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="expense-item-right">
                  <span className="expense-item-amount">{formatCurrency(exp.amount)}</span>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(exp)} style={{ padding: '4px 8px' }}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(exp._id)} style={{ padding: '4px 8px' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">No Expenses This Month</h3>
            <p className="empty-state-text">Start tracking your daily expenses to understand your spending habits</p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Log Your First Expense</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Expense' : 'Add Expense'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="500" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g., Lunch at restaurant" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="Any additional notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add'} Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
