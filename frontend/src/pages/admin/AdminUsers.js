import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, role);
      toast.success('Role updated!');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      toast.success('User status updated!');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{total} total users</p>
        </div>
        <input className="form-input" placeholder="🔍 Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '260px' }} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', background: user.role === 'admin' ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => handleToggleStatus(user._id)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No users found</div>}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;