import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { assetsAPI } from '../../services/api';
import { formatCurrency, formatPercent, formatDate, ASSET_TYPES, CHART_COLORS } from '../../utils/helpers';
import './Assets.css';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [formData, setFormData] = useState({
    type: 'savings', name: '', institution: '', amount: '',
    interestRate: '', currentValue: '', purchaseDate: '',
    maturityDate: '', quantity: '', buyPrice: '', currentPrice: '', notes: ''
  });

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    try {
      const data = await assetsAPI.getAll();
      setAssets(data.assets);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '') delete payload[k];
        else if (['amount', 'interestRate', 'currentValue', 'quantity', 'buyPrice', 'currentPrice'].includes(k)) {
          payload[k] = Number(payload[k]);
        }
      });
      if (editAsset) {
        await assetsAPI.update(editAsset._id, payload);
      } else {
        await assetsAPI.create(payload);
      }
      setShowModal(false);
      setEditAsset(null);
      resetForm();
      loadAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this asset?')) {
      try {
        await assetsAPI.delete(id);
        loadAssets();
      } catch (err) { console.error(err); }
    }
  };

  const openEdit = (asset) => {
    setEditAsset(asset);
    setFormData({
      type: asset.type, name: asset.name, institution: asset.institution || '',
      amount: asset.amount || '', interestRate: asset.interestRate || '',
      currentValue: asset.currentValue || '', purchaseDate: asset.purchaseDate?.split('T')[0] || '',
      maturityDate: asset.maturityDate?.split('T')[0] || '', quantity: asset.quantity || '',
      buyPrice: asset.buyPrice || '', currentPrice: asset.currentPrice || '', notes: asset.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'savings', name: '', institution: '', amount: '',
      interestRate: '', currentValue: '', purchaseDate: '',
      maturityDate: '', quantity: '', buyPrice: '', currentPrice: '', notes: ''
    });
  };

  const isMarketAsset = formData.type === 'stock' || formData.type === 'mutualFund' || formData.type === 'crypto';

  // Chart data
  const allocationData = summary?.byType
    ? Object.entries(summary.byType).map(([type, data]) => ({
        name: ASSET_TYPES[type]?.label || type,
        value: data.currentValue
      }))
    : [];

  const investedData = summary?.byType
    ? Object.entries(summary.byType).map(([type, data]) => ({
        name: ASSET_TYPES[type]?.label || type,
        value: data.invested
      }))
    : [];

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="auth-spinner" style={{ width: 40, height: 40 }}></div>
          <p>Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Assets & Investments</h1>
          <p className="page-subtitle">Track and manage all your investments in one place</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditAsset(null); setShowModal(true); }}>
          + Add Asset
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-card-icon accent">💰</div>
          <div className="stat-card-label">Total Invested</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalInvested)}</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-card-icon primary">📈</div>
          <div className="stat-card-label">Current Value</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalCurrentValue)}</div>
        </div>
        <div className={`stat-card ${summary?.totalProfit >= 0 ? 'accent' : 'warm'}`}>
          <div className={`stat-card-icon ${summary?.totalProfit >= 0 ? 'accent' : 'danger'}`}>
            {summary?.totalProfit >= 0 ? '📊' : '📉'}
          </div>
          <div className="stat-card-label">Total Returns</div>
          <div className="stat-card-value">{formatCurrency(summary?.totalProfit)}</div>
          <div className={`stat-card-change ${summary?.totalProfit >= 0 ? 'positive' : 'negative'}`}>
            {summary?.totalInvested > 0 ? formatPercent((summary.totalProfit / summary.totalInvested) * 100) : '0%'}
          </div>
        </div>
      </div>

      {/* Charts */}
      {allocationData.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Asset Allocation</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                  {allocationData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {allocationData.map((item, i) => (
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
              <h3 className="chart-card-title">Amount Invested by Type</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={investedData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                  {investedData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {investedData.map((item, i) => (
                <div key={i} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                  <span className="chart-legend-label">{item.name}</span>
                  <span className="chart-legend-value">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assets Table */}
      {assets.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Invested</th>
                <th>Current Value</th>
                <th>Returns</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => {
                const isMarket = ['stock', 'mutualFund', 'crypto'].includes(asset.type);
                const invested = isMarket ? asset.buyPrice * asset.quantity : asset.amount;
                const current = isMarket ? asset.currentPrice * asset.quantity : (asset.currentValue || asset.amount);
                const pl = current - invested;
                const plPercent = invested > 0 ? (pl / invested) * 100 : 0;

                return (
                  <tr key={asset._id}>
                    <td>
                      <div className="asset-name-cell">
                        <span className="asset-type-icon">{ASSET_TYPES[asset.type]?.icon}</span>
                        <div>
                          <div className="asset-name">{asset.name}</div>
                          {asset.institution && <div className="asset-institution">{asset.institution}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{ASSET_TYPES[asset.type]?.label}</span></td>
                    <td>{formatCurrency(invested)}</td>
                    <td className="font-semibold">{formatCurrency(current)}</td>
                    <td>
                      <span className={pl >= 0 ? 'text-positive' : 'text-negative'}>
                        {formatCurrency(pl)} ({formatPercent(plPercent)})
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(asset)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(asset._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <h3 className="empty-state-title">No Assets Yet</h3>
            <p className="empty-state-text">Start tracking your investments by adding your first asset</p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Your First Asset</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Asset Type</label>
                <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  {Object.entries(ASSET_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" placeholder="e.g., HDFC Savings" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input className="form-input" placeholder="e.g., HDFC Bank" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} />
                </div>
              </div>

              {isMarketAsset ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-input" placeholder="10" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Buy Price (per unit)</label>
                      <input type="number" className="form-input" placeholder="150" value={formData.buyPrice} onChange={e => setFormData({ ...formData, buyPrice: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Price (per unit)</label>
                    <input type="number" className="form-input" placeholder="180" value={formData.currentPrice} onChange={e => setFormData({ ...formData, currentPrice: e.target.value })} required />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount Invested</label>
                      <input type="number" className="form-input" placeholder="100000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Value</label>
                      <input type="number" className="form-input" placeholder="105000" value={formData.currentValue} onChange={e => setFormData({ ...formData, currentValue: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Interest Rate (%)</label>
                      <input type="number" step="0.01" className="form-input" placeholder="7.5" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Maturity Date</label>
                      <input type="date" className="form-input" value={formData.maturityDate} onChange={e => setFormData({ ...formData, maturityDate: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input type="date" className="form-input" value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" placeholder="Optional notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editAsset ? 'Update' : 'Add'} Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
