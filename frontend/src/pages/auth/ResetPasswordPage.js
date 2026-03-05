import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(token, form.password);
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      toast.success('Password reset successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Reset password</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Enter your new password below.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;