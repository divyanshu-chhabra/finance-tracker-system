import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { incomeAPI } from '../../services/api';
import { formatCurrency, formatDate, INCOME_SOURCES, FREQUENCY_LABELS, CHART_COLORS } from '../../utils/helpers';
import './Income.css';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    source: 'salary', name: '', amount: '', frequency: 'monthly',
    date: new Date().toISOString().split('T')[0],
    isRecurring: true, notes: ''
  });

  useEffect(() => { loadIncomes(); }, []);

  const loadIncomes = async () => {
    try {
      const data = await incomeAPI.getAll();
      setIncomes(data.incomes);
      setSummary(data.summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      if (editItem) {
        await incomeAPI.update(editItem._id, payload);
      } else {
        await incomeAPI.create(payload);
      }
      setShowModal(false);
      setEditItem(null);
      resetForm();
      loadIncomes();
      showToast(editItem ? 'Income updated!' : 'Income added!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this income entry?')) {
      try {
        await incomeAPI.delete(id);
        loadIncomes();
        showToast('Income removed', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      source: item.source, name: item.name, amount: item.amount,
      frequency: item.frequency, date: item.date?.split('T')[0] || '',
      isRecurring: item.isRecurring, notes: item.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      source: 'salary', name: '', amount: '', frequency: 'monthly',
      date: new Date().toISOString().split('T')[0],
      isRecurring: true, notes: ''
    });
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Source distribution chart
  const sourceData = summary?.sourceTotals
    ? Object.entries(summary.sourceTotals).map(([source, amount]) => ({
        name: INCOME_SOURCES[source]?.label || source,
        value: amount,
        icon: INCOME_SOURCES[source]?.icon || '📦'
      }))
    : [];

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="auth-spinner" style={{ width: 40, height: 40 }}></div>
          <p>Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="page-title">Income Tracker</h1>
          <p className="page-subtitle">Track all your income sources in one place</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditItem(null); setShowModal(true); }}>
          + Add Income
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-card-icon accent">💰</div>
          <div className="stat-card-label">Total Recorded</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalAmount)}</div>
          <div className="stat-card-change positive">{summary?.count || 0} entries</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-card-icon primary">📊</div>
          <div className="stat-card-label">Monthly Recurring</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalMonthlyRecurring)}</div>
        </div>
        <div className="stat-card cool">
          <div className="stat-card-icon cool">🏷️</div>
          <div className="stat-card-label">Income Sources</div>
          <div className="stat-card-value">{Object.keys(summary?.sourceTotals || {}).length}</div>
        </div>
      </div>

      {/* Chart & List */}
      <div className="charts-grid">
        {sourceData.length > 0 && (
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Income by Source</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={105} paddingAngle={3} dataKey="value">
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {sourceData.map((item, i) => (
                <div key={i} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                  <span className="chart-legend-label">{item.icon} {item.name}</span>
                  <span className="chart-legend-value">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="chart-card income-streams-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Recurring Streams</h3>
          </div>
          <div className="income-streams">
            {incomes.filter(i => i.isRecurring && i.isActive).length > 0 ? (
              incomes.filter(i => i.isRecurring && i.isActive).map(inc => (
                <div key={inc._id} className="income-stream-item">
                  <div className="income-stream-left">
                    <span className="income-stream-icon" style={{ background: `${INCOME_SOURCES[inc.source]?.color}20` }}>
                      {INCOME_SOURCES[inc.source]?.icon}
                    </span>
                    <div>
                      <div className="income-stream-name">{inc.name}</div>
                      <div className="income-stream-freq">{FREQUENCY_LABELS[inc.frequency]?.label}</div>
                    </div>
                  </div>
                  <span className="income-stream-amount">{formatCurrency(inc.amount)}{FREQUENCY_LABELS[inc.frequency]?.short}</span>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <div className="empty-state-icon">📊</div>
                <p className="empty-state-text">No recurring income streams yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Income List */}
      {incomes.length > 0 ? (
        <div className="income-list">
          <div className="chart-card-header">
            <h3 className="chart-card-title">All Income Entries</h3>
            <span className="badge badge-accent">{incomes.length} items</span>
          </div>
          <div className="income-items">
            {incomes.map(inc => (
              <div key={inc._id} className="income-item">
                <div className="income-item-left">
                  <span className="income-item-icon" style={{ background: `${INCOME_SOURCES[inc.source]?.color}20` }}>
                    {INCOME_SOURCES[inc.source]?.icon || '📦'}
                  </span>
                  <div>
                    <div className="income-item-name">{inc.name}</div>
                    <div className="income-item-meta">
                      <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {INCOME_SOURCES[inc.source]?.label}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {FREQUENCY_LABELS[inc.frequency]?.label}
                      </span>
                      <span>{formatDate(inc.date)}</span>
                      {inc.isRecurring && <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>Recurring</span>}
                    </div>
                  </div>
                </div>
                <div className="income-item-right">
                  <span className="income-item-amount">{formatCurrency(inc.amount)}</span>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(inc)} style={{ padding: '4px 8px' }}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inc._id)} style={{ padding: '4px 8px' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <h3 className="empty-state-title">No Income Entries</h3>
            <p className="empty-state-text">Start tracking your income sources — salary, freelance, rentals, and more</p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Your First Income</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Income' : 'Add Income'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" placeholder="e.g., Monthly Salary from Acme Inc" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Source Type</label>
                  <select className="form-select" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                    {Object.entries(INCOME_SOURCES).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                    <option value="one-time">One-time</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="50000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary-500)' }}
                  />
                  This is a recurring income
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="Any additional notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add'} Income</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
};

export default Income;
