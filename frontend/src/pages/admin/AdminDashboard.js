import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ icon, label, value, sub, color = 'var(--accent-light)' }) => (
  <div className="card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: '28px' }}>{icon}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (!data) return <div>Error loading dashboard</div>;

  const { stats, monthlyRevenue, bestSelling, orderStatusBreakdown } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-light)' }}>₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payload[1]?.value} orders</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>Welcome back. Here's what's happening.</p>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatCard icon="💰" label="Total Revenue" value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`} sub="All time" color="var(--success)" />
        <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} sub="All time" />
        <StatCard icon="🛍" label="Products" value={stats.totalProducts} sub={stats.lowStockCount > 0 ? `⚠ ${stats.lowStockCount} low stock` : 'All in stock'} />
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} sub="Registered users" />
      </div>

      {/* Revenue Chart */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '20px' }}>Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        {/* Best Selling */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '20px' }}>Best Selling Products</h2>
          {bestSelling.map((product, i) => (
            <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < bestSelling.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: 'var(--accent-light)', flexShrink: 0 }}>#{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>₹{product.price?.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.sold} sold</div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Status */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '20px' }}>Order Status Breakdown</h2>
          {orderStatusBreakdown.map(({ _id, count }) => {
            const colors = { Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#10b981', Cancelled: '#ef4444' };
            const total = orderStatusBreakdown.reduce((s, i) => s + i.count, 0);
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={_id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{_id}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: colors[_id] || 'var(--accent)', borderRadius: '3px', transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
