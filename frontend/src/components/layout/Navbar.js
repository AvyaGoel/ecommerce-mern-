import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };

  const cartCount = cart?.totalItems || 0;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">ShopMERN</span>
        </Link>

        <div className="navbar-links">
          <Link to="/products" className="nav-link">Products</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/cart" className="cart-btn">
                🛒
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <div className="user-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
                <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                  <span className="chevron">{dropdownOpen ? '▲' : '▼'}</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item admin-item" onClick={() => setDropdownOpen(false)}>
                        ⚙️ Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>👤 Profile</Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>📦 My Orders</Link>
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item danger">🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          {user ? (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
