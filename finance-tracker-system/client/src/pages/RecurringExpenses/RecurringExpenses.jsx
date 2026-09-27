import { useState, useEffect } from 'react';
import { recurringExpensesAPI } from '../../services/api';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, FREQUENCY_LABELS } from '../../utils/helpers';
import './RecurringExpenses.css';

const RecurringExpenses = () => {
  const [recurring, setRecurring] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    category: 'rent', amount: '', description: '',
    frequency: 'monthly', startDate: new Date().toISOString().split('T')[0],
    endDate: '', notes: ''
  });

  useEffect(() => { loadRecurring(); }, []);

  const loadRecurring = async () => {
    try {
      const data = await recurringExpensesAPI.getAll();
      setRecurring(data.recurringExpenses);
      setSummary(data.summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      if (!payload.endDate) delete payload.endDate;
      if (editItem) {
        await recurringExpensesAPI.update(editItem._id, payload);
      } else {
        await recurringExpensesAPI.create(payload);
      }
      setShowModal(false);
      setEditItem(null);
      resetForm();
      loadRecurring();
      showToast(editItem ? 'Recurring expense updated!' : 'Recurring expense added!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this recurring expense?')) {
      try {
        await recurringExpensesAPI.delete(id);
        loadRecurring();
        showToast('Recurring expense removed', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    }
  };

  const handleToggle = async (id) => {
    try {
      await recurringExpensesAPI.toggle(id);
      loadRecurring();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleGenerate = async () => {
    try {
      const result = await recurringExpensesAPI.generate();
      loadRecurring();
      showToast(`Generated ${result.count} expense(s) from recurring`, 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      category: item.category, amount: item.amount,
      description: item.description, frequency: item.frequency,
      startDate: item.startDate?.split('T')[0] || '',
      endDate: item.endDate?.split('T')[0] || '',
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'rent', amount: '', description: '',
      frequency: 'monthly', startDate: new Date().toISOString().split('T')[0],
      endDate: '', notes: ''
    });
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getMonthlyEquivalent = (amount, frequency) => {
    switch (frequency) {
      case 'daily': return amount * 30;
      case 'weekly': return amount * 4.33;
      case 'monthly': return amount;
      case 'yearly': return amount / 12;
      default: return amount;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="auth-spinner" style={{ width: 40, height: 40 }}></div>
          <p>Loading recurring expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="page-title">Recurring Expenses</h1>
          <p className="page-subtitle">Manage subscriptions, rent, EMIs and auto-tracked expenses</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button className="btn btn-accent" onClick={handleGenerate}>
            ⚡ Generate Due
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setEditItem(null); setShowModal(true); }}>
            + Add Recurring
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-icon primary">🔄</div>
          <div className="stat-card-label">Monthly Cost</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalMonthly)}</div>
          <div className="stat-card-change">{summary?.activeCount || 0} active subscriptions</div>
        </div>
        <div className="stat-card warm">
          <div className="stat-card-icon warm">📅</div>
          <div className="stat-card-label">Yearly Cost</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalYearly)}</div>
        </div>
        <div className="stat-card cool">
          <div className="stat-card-icon cool">📋</div>
          <div className="stat-card-label">Total Items</div>
          <div className="stat-card-value">{summary?.totalCount || 0}</div>
          <div className="stat-card-change">{(summary?.totalCount || 0) - (summary?.activeCount || 0)} paused</div>
        </div>
      </div>

      {/* Recurring List */}
      {recurring.length > 0 ? (
        <div className="recurring-list">
          <div className="chart-card-header">
            <h3 className="chart-card-title">All Recurring Expenses</h3>
            <span className="badge badge-primary">{recurring.length} items</span>
          </div>
          <div className="recurring-items">
            {recurring.map(item => (
              <div key={item._id} className={`recurring-item ${!item.isActive ? 'inactive' : ''}`}>
                <div className="recurring-item-left">
                  <span className="recurring-item-icon" style={{ background: `${EXPENSE_CATEGORIES[item.category]?.color}20` }}>
                    {EXPENSE_CATEGORIES[item.category]?.icon || '📦'}
                  </span>
                  <div>
                    <div className="recurring-item-desc">{item.description}</div>
                    <div className="recurring-item-meta">
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {EXPENSE_CATEGORIES[item.category]?.label}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {FREQUENCY_LABELS[item.frequency]?.label}
                      </span>
                      {item.nextDueDate && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          Next: {formatDate(item.nextDueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="recurring-item-right">
                  <div className="recurring-amounts">
                    <span className="recurring-item-amount">
                      {formatCurrency(item.amount)}{FREQUENCY_LABELS[item.frequency]?.short}
                    </span>
                    {item.frequency !== 'monthly' && (
                      <span className="recurring-item-monthly">
                        ~{formatCurrency(getMonthlyEquivalent(item.amount, item.frequency))}/mo
                      </span>
                    )}
                  </div>
                  <div className="recurring-actions">
                    <button
                      className={`btn btn-sm ${item.isActive ? 'btn-accent' : 'btn-ghost'}`}
                      onClick={() => handleToggle(item._id)}
                      title={item.isActive ? 'Pause' : 'Resume'}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      {item.isActive ? '⏸' : '▶️'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)} style={{ padding: '4px 8px' }}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(item._id)} style={{ padding: '4px 8px' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔄</div>
            <h3 className="empty-state-title">No Recurring Expenses</h3>
            <p className="empty-state-text">Add subscriptions, rent, EMIs and other recurring costs to auto-track them</p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Your First Recurring Expense</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g., Netflix Subscription" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="500" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">End Date (optional)</label>
                <input type="date" className="form-input" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="Any additional notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add'} Recurring Expense</button>
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

export default RecurringExpenses;
