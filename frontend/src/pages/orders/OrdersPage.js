import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders().then(({ data }) => { setOrders(data.orders); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>My Orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '12px' }}>No orders yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ transition: 'var(--transition)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>#{order._id.slice(-12).toUpperCase()}</div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{order.orderItems?.length} item(s)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</div>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;