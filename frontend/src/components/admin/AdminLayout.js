import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/products', label: 'Products', icon: '🛍' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
  ];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? '240px' : '72px', flexShrink: 0, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100, overflow: 'hidden' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>⚡</span>
          {sidebarOpen && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>Admin Panel</span>}
        </div>
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map(({ path, label, icon, exact }) => (
            <Link key={path} to={path}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '4px', color: isActive(path, exact) ? 'var(--accent-light)' : 'var(--text-secondary)', background: isActive(path, exact) ? 'var(--accent-glow)' : 'transparent', fontWeight: isActive(path, exact) ? 600 : 400, transition: 'var(--transition)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
              {sidebarOpen && <span style={{ fontSize: '14px' }}>{label}</span>}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 8px', borderTop: '1px solid var(--border)' }}>
          <Link to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            <span style={{ flexShrink: 0 }}>🏠</span>
            {sidebarOpen && 'Back to Store'}
          </Link>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            <span style={{ flexShrink: 0 }}>🚪</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: sidebarOpen ? '240px' : '72px', flex: 1, transition: 'margin-left 0.3s ease' }}>
        <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer', padding: '8px' }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: 'white' }}>{user?.name?.charAt(0)}</div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{user?.name}</span>
          </div>
        </header>
        <div style={{ padding: '32px 24px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
