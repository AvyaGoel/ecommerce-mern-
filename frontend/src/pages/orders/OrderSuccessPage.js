import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderAPI.getOne(id).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-in" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Order Placed!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Your order has been successfully placed. You'll receive a confirmation soon.
        </p>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Order ID</span>
            <span style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'monospace' }}>#{id?.slice(-12).toUpperCase()}</span>
          </div>
          {order && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total</span>
                <span style={{ fontWeight: 700 }}>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Payment</span>
                <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{order.paymentMethod}</span>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/orders/${id}`} className="btn btn-primary">View Order Details</Link>
          <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;