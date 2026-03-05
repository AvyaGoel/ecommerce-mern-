import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '48px 0 24px', marginTop: '80px' }}>
    <div className="container">
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>⚡ ShopMERN</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>Premium shopping experience built with the MERN stack.</p>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Shop</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/products" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All Products</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Account</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/profile" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Profile</Link>
            <Link to="/orders" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Orders</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Support</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>support@shopmern.com</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        © {new Date().getFullYear()} ShopMERN. Built with MERN Stack.
      </div>
    </div>
  </footer>
);

export default Footer;
