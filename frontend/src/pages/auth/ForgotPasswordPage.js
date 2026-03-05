import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Check your email</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>We sent a password reset link to <strong>{email}</strong></p>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Forgot password?</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <Link to="/login" style={{ color: 'var(--accent-light)' }}>← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;