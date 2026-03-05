import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, updateCart, removeFromCart, cartLoading } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = async (productId, qty) => {
    try { await updateCart(productId, qty); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handleRemove = async (productId) => {
    try { await removeFromCart(productId); toast.success('Item removed'); }
    catch { toast.error('Remove failed'); }
  };

  if (cartLoading) return <div className="loading-center"><div className="spinner" /></div>;

  if (!cart?.items?.length) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Start shopping to add items to your cart</p>
      <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>Your Cart ({cart.totalItems} items)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        <div>
          {cart.items.map((item) => (
            <div key={item.product?._id || item._id} className="card" style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '16px' }}>
              <div style={{ width: '88px', height: '88px', flexShrink: 0, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {item.image || item.product?.images?.[0]?.url
                  ? <img src={item.image || item.product.images[0].url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🖼️</div>
                }
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name || item.product?.name}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>₹{item.price?.toLocaleString('en-IN')} each</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <button onClick={() => handleQtyChange(item.product?._id || item.product, item.quantity - 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '16px' }}>−</button>
                    <span style={{ padding: '6px 12px', fontWeight: 600, minWidth: '36px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => handleQtyChange(item.product?._id || item.product, item.quantity + 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '16px' }}>+</button>
                  </div>
                  <button onClick={() => handleRemove(item.product?._id || item.product)} className="btn btn-danger btn-sm">Remove</button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{ position: 'sticky', top: '88px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>₹{cart.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span>Shipping</span>
                <span style={{ color: cart.totalPrice > 999 ? 'var(--success)' : undefined }}>{cart.totalPrice > 999 ? 'FREE' : '₹99'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span>GST (18%)</span>
                <span>₹{(cart.totalPrice * 0.18).toFixed(0)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}>
                <span>Total</span>
                <span>₹{(cart.totalPrice + (cart.totalPrice > 999 ? 0 : 99) + cart.totalPrice * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            {cart.totalPrice <= 999 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: '16px', fontSize: '13px', color: 'var(--warning)' }}>
                Add ₹{(999 - cart.totalPrice + 1).toLocaleString('en-IN')} more for FREE shipping!
              </div>
            )}
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
            <Link to="/products" className="btn btn-ghost btn-full" style={{ marginTop: '8px' }}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;