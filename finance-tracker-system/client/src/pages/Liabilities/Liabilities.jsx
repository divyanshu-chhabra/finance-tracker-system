import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { liabilitiesAPI } from '../../services/api';
import { formatCurrency, formatDate, LIABILITY_TYPES, CHART_COLORS } from '../../utils/helpers';
import './Liabilities.css';

const Liabilities = () => {
  const [liabilities, setLiabilities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'homeLoan', name: '', institution: '', principal: '',
    interestRate: '', emi: '', tenure: '', startDate: '',
    outstandingBalance: '', dueDate: '', notes: ''
  });

  useEffect(() => { loadLiabilities(); }, []);

  const loadLiabilities = async () => {
    try {
      const data = await liabilitiesAPI.getAll();
      setLiabilities(data.liabilities);
      setSummary(data.summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '') delete payload[k];
        else if (['principal', 'interestRate', 'emi', 'tenure', 'outstandingBalance', 'dueDate'].includes(k)) {
          payload[k] = Number(payload[k]);
        }
      });
      if (editItem) {
        await liabilitiesAPI.update(editItem._id, payload);
      } else {
        await liabilitiesAPI.create(payload);
      }
      setShowModal(false);
      setEditItem(null);
      resetForm();
      loadLiabilities();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this liability?')) {
      try { await liabilitiesAPI.delete(id); loadLiabilities(); }
      catch (err) { console.error(err); }
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      type: item.type, name: item.name, institution: item.institution || '',
      principal: item.principal || '', interestRate: item.interestRate || '',
      emi: item.emi || '', tenure: item.tenure || '',
      startDate: item.startDate?.split('T')[0] || '',
      outstandingBalance: item.outstandingBalance || '',
      dueDate: item.dueDate || '', notes: item.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'homeLoan', name: '', institution: '', principal: '',
      interestRate: '', emi: '', tenure: '', startDate: '',
      outstandingBalance: '', dueDate: '', notes: ''
    });
  };

  // Chart data
  const typeData = summary?.byType
    ? Object.entries(summary.byType).map(([type, data]) => ({
        name: LIABILITY_TYPES[type]?.label || type,
        value: data.outstanding
      }))
    : [];

  const emiData = summary?.byType
    ? Object.entries(summary.byType).map(([type, data]) => ({
        name: LIABILITY_TYPES[type]?.label || type,
        emi: data.emi,
        outstanding: data.outstanding
      }))
    : [];

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="auth-spinner" style={{ width: 40, height: 40 }}></div>
          <p>Loading liabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Loans & Liabilities</h1>
          <p className="page-subtitle">Manage your loans, EMIs, and other liabilities</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditItem(null); setShowModal(true); }}>
          + Add Liability
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card warm">
          <div className="stat-card-icon warm">🏦</div>
          <div className="stat-card-label">Total Borrowed</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalPrincipal)}</div>
        </div>
        <div className="stat-card cool">
          <div className="stat-card-icon danger">💸</div>
          <div className="stat-card-label">Outstanding Balance</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalOutstanding)}</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-card-icon primary">📅</div>
          <div className="stat-card-label">Monthly EMI</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalEMI)}</div>
        </div>
      </div>

      {/* Charts */}
      {typeData.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Liability Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {typeData.map((item, i) => (
                <div key={i} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                  <span className="chart-legend-label">{item.name}</span>
                  <span className="chart-legend-value">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">EMI by Loan Type</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={emiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="var(--text-tertiary)" />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                <Bar dataKey="emi" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Monthly EMI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Liability Cards */}
      {liabilities.length > 0 ? (
        <div className="liability-cards">
          {liabilities.map(item => {
            const paidPercent = item.principal > 0 ? ((item.principal - item.outstandingBalance) / item.principal) * 100 : 0;
            return (
              <div key={item._id} className="liability-card card">
                <div className="liability-card-header">
                  <div className="liability-card-info">
                    <span className="liability-type-icon">{LIABILITY_TYPES[item.type]?.icon}</span>
                    <div>
                      <h3 className="liability-card-name">{item.name}</h3>
                      <span className="badge badge-warning">{LIABILITY_TYPES[item.type]?.label}</span>
                    </div>
                  </div>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(item._id)}>🗑️</button>
                  </div>
                </div>

                <div className="liability-card-stats">
                  <div className="liability-stat">
                    <span className="liability-stat-label">Principal</span>
                    <span className="liability-stat-value">{formatCurrency(item.principal)}</span>
                  </div>
                  <div className="liability-stat">
                    <span className="liability-stat-label">Outstanding</span>
                    <span className="liability-stat-value text-negative">{formatCurrency(item.outstandingBalance)}</span>
                  </div>
                  <div className="liability-stat">
                    <span className="liability-stat-label">EMI</span>
                    <span className="liability-stat-value">{formatCurrency(item.emi)}/mo</span>
                  </div>
                  <div className="liability-stat">
                    <span className="liability-stat-label">Interest</span>
                    <span className="liability-stat-value">{item.interestRate}%</span>
                  </div>
                </div>

                <div className="liability-progress">
                  <div className="liability-progress-header">
                    <span>{paidPercent.toFixed(1)}% paid off</span>
                    <span>{item.monthsRemaining || 0} months remaining</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${paidPercent > 70 ? 'accent' : paidPercent > 30 ? '' : 'warn'}`}
                      style={{ width: `${Math.min(paidPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <h3 className="empty-state-title">No Liabilities</h3>
            <p className="empty-state-text">Great! You're debt-free. If you have loans, add them here to track.</p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Liability</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Liability' : 'Add New Liability'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Loan Type</label>
                <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  {Object.entries(LIABILITY_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" placeholder="e.g., Home Loan" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input className="form-input" placeholder="e.g., SBI" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Principal Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="500000" value={formData.principal} onChange={e => setFormData({ ...formData, principal: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Outstanding Balance (₹)</label>
                  <input type="number" className="form-input" placeholder="300000" value={formData.outstandingBalance} onChange={e => setFormData({ ...formData, outstandingBalance: e.target.value })} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Interest Rate (%)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="8.5" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly EMI (₹)</label>
                  <input type="number" className="form-input" placeholder="15000" value={formData.emi} onChange={e => setFormData({ ...formData, emi: e.target.value })} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tenure (months)</label>
                  <input type="number" className="form-input" placeholder="240" value={formData.tenure} onChange={e => setFormData({ ...formData, tenure: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" placeholder="Optional notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add'} Liability</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liabilities;
