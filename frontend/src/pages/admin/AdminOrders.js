import React, { useState, useEffect, useCallback } from 'react';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await orderAPI.getAll(params);
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!newStatus) { toast.error('Select a status'); return; }
    setUpdating(true);
    try {
      await orderAPI.updateStatus(selectedOrder._id, newStatus, updateNote);
      toast.success('Order status updated!');
      setSelectedOrder(null);
      setNewStatus('');
      setUpdateNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setUpdating(false);
  };

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Orders</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setStatusFilter(''); setPage(1); }}>All</button>
          {statuses.map((s) => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>#{order._id.slice(-8).toUpperCase()}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 600 }}>{order.user?.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.user?.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{order.orderItems?.length}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                    <span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span>
                    {order.isPaid && <div style={{ color: 'var(--success)', fontSize: '11px' }}>✓ Paid</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}><OrderStatusBadge status={order.orderStatus} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus); setUpdateNote(''); }}>Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No orders found</div>}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span style={{ padding: '7px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 700 }}>Update Order Status</h2>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order: </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{selectedOrder._id.slice(-8).toUpperCase()}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '16px' }}>Customer: </span>
              <span style={{ fontWeight: 600 }}>{selectedOrder.user?.name}</span>
            </div>
            <div className="form-group">
              <label className="form-label">New Status</label>
              <select className="form-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-input" value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="e.g. Dispatched via FedEx" />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={updating}>{updating ? 'Updating...' : 'Update Status'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;