import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/income', icon: '💵', label: 'Income' },
    { path: '/assets', icon: '💰', label: 'Assets' },
    { path: '/liabilities', icon: '🏦', label: 'Liabilities' },
    { path: '/expenses', icon: '📝', label: 'Expenses' },
    { path: '/recurring', icon: '🔄', label: 'Recurring' },
    { path: '/ai-bot', icon: '🤖', label: 'AI Advisor' },
  ];

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">💎</span>
          <span className="sidebar-logo-text">FinanceMore</span>
        </div>
        <div className="sidebar-credit">
          <span>Created by Divyanshu Chhabra</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/'}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'User'}</span>
            <span className="sidebar-user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button
          className="sidebar-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="theme-toggle-btn"
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
        <button className="sidebar-logout" onClick={handleLogout} id="logout-btn">
          <span>⏻</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

