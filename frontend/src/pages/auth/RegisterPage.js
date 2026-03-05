import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Create account</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Start shopping today</p>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} required />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-light)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;