import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOne(id).then(({ data }) => { setOrder(data.order); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <div style={{ textAlign: 'center', padding: '60px' }}>Order not found</div>;

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = steps.indexOf(order.orderStatus);

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Order Details</h1>
          <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>#{order._id.slice(-12).toUpperCase()}</div>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      {/* Progress */}
      {order.orderStatus !== 'Cancelled' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: 'var(--border)' }} />
            <div style={{ position: 'absolute', top: '16px', left: '10%', height: '2px', background: 'var(--accent)', width: `${Math.max(0, currentStep / (steps.length - 1)) * 80}%`, transition: 'width 0.5s' }} />
            {steps.map((step, i) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i <= currentStep ? 'var(--accent)' : 'var(--bg-elevated)', border: `2px solid ${i <= currentStep ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: i <= currentStep ? 'white' : 'var(--text-muted)' }}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '12px', fontWeight: i === currentStep ? 600 : 400, color: i <= currentStep ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div>
          {/* Items */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '16px' }}>Items Ordered</h2>
            {order.orderItems?.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🖼️</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '16px' }}>Shipping Address</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
              <div>{order.shippingAddress?.street}</div>
              <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</div>
              <div>{order.shippingAddress?.country}</div>
              <div style={{ marginTop: '8px' }}>📞 {order.shippingAddress?.phone}</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '16px' }}>Order Summary</h2>
            {[
              ['Items', `₹${order.itemsPrice?.toLocaleString('en-IN')}`],
              ['Shipping', order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`],
              ['Tax (GST)', `₹${order.taxPrice?.toLocaleString('en-IN')}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ color: value === 'FREE' ? 'var(--success)' : undefined }}>{value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}>
              <span>Total</span>
              <span>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Payment Method</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod}</div>
              {order.isPaid && <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>✓ Paid on {new Date(order.paidAt).toLocaleDateString()}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;