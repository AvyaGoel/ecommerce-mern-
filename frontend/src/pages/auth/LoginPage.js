import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-12px' }}>
            <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent-light)' }}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-light)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;