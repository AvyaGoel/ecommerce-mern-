import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [address, setAddress] = useState({
    street: '', city: '', state: '', postalCode: '', country: 'India', phone: '',
  });

  const itemsPrice = cart.totalPrice || 0;
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const taxPrice = +(itemsPrice * 0.18).toFixed(2);
  const totalPrice = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const handlePlaceOrder = async () => {
    for (const [k, v] of Object.entries(address)) {
      if (!v) { toast.error(`${k} is required`); return; }
    }
    if (!cart?.items?.length) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const { data } = await orderAPI.create({ shippingAddress: address, paymentMethod });
      const orderId = data.order._id;

      if (paymentMethod === 'razorpay') {
        const { data: rpData } = await paymentAPI.createRazorpayOrder(orderId);
        const options = {
          key: rpData.keyId,
          amount: rpData.amount,
          currency: rpData.currency,
          name: 'ShopMERN',
          description: `Order #${orderId.slice(-8)}`,
          order_id: rpData.razorpayOrderId,
          handler: async (response) => {
            try {
              await paymentAPI.verifyPayment({ ...response, orderId });
              await fetchCart();
              toast.success('Payment successful!');
              navigate(`/order-success/${orderId}`);
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: { name: user.name, email: user.email, contact: address.phone },
          theme: { color: '#7c3aed' },
          modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        await fetchCart();
        toast.success('Order placed successfully!');
        navigate(`/order-success/${orderId}`);
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
        <div>
          {/* Shipping Address */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>📦 Shipping Address</h2>
            <div className="grid-2">
              {[
                { key: 'street', label: 'Street Address', placeholder: '123 Main Street', full: true },
                { key: 'city', label: 'City', placeholder: 'Mumbai' },
                { key: 'state', label: 'State', placeholder: 'Maharashtra' },
                { key: 'postalCode', label: 'Postal Code', placeholder: '400001' },
                { key: 'country', label: 'Country', placeholder: 'India' },
                { key: 'phone', label: 'Phone Number', placeholder: '+91 9876543210' },
              ].map(({ key, label, placeholder, full }) => (
                <div key={key} className="form-group" style={full ? { gridColumn: '1 / -1' } : {}}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" placeholder={placeholder} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} required />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>💳 Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { value: 'razorpay', label: 'Razorpay', desc: 'Credit/Debit Card, UPI, Net Banking, Wallets', icon: '💳' },
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
              ].map(({ value, label, desc, icon }) => (
                <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `2px solid ${paymentMethod === value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', background: paymentMethod === value ? 'var(--accent-glow)' : 'transparent', transition: 'var(--transition)' }}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} style={{ accentColor: 'var(--accent)' }} />
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '88px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h2>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
              {cart.items?.map((item) => (
                <div key={item.product?._id || item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name || item.product?.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                ['Subtotal', `₹${itemsPrice.toLocaleString('en-IN')}`],
                ['Shipping', shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`],
                ['GST (18%)', `₹${taxPrice.toLocaleString('en-IN')}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <span>{label}</span>
                  <span style={{ color: value === 'FREE' ? 'var(--success)' : undefined }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '20px' }}>
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Processing...' : paymentMethod === 'razorpay' ? '💳 Pay Now' : '📦 Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;