import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile(profileForm);
      setUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: 'white' }}>{user?.name?.charAt(0)}</div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>{user?.name}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user?.email}</div>
        </div>
        <div className="badge badge-default" style={{ marginLeft: 'auto', textTransform: 'capitalize' }}>{user?.role}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        {[{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === tab.id ? 600 : 400, borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`, cursor: 'pointer', fontSize: '14px', marginBottom: '-1px' }}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '20px' }}>Edit Profile</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '20px' }}>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" type="password" value={passwordForm[key]} onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })} placeholder="..." required />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
