import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const StarRating = ({ rating, interactive = false, onRate }) => (
  <div className="stars" style={{ fontSize: interactive ? '24px' : '16px', cursor: interactive ? 'pointer' : 'default' }}>
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={s <= Math.round(rating) ? 'star' : 'star empty'} onClick={() => interactive && onRate && onRate(s)}>★</span>
    ))}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    productAPI.getOne(id)
      .then(({ data }) => { setProduct(data.product); setLoading(false); })
      .catch(() => { toast.error('Product not found'); navigate('/products'); });
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login'); navigate('/login'); return; }
    setCartLoading(true);
    try {
      await addToCart(product._id, qty);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
    setCartLoading(false);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); return; }
    setReviewLoading(true);
    try {
      await productAPI.review(id, review);
      toast.success('Review submitted!');
      const { data } = await productAPI.getOne(id);
      setProduct(data.product);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setReviewLoading(false);
  };

  if (loading) return <LoadingSpinner size="large" text="Loading product..." />;
  if (!product) return null;

  const price = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '60px' }}>
        {/* Images */}
        <div>
          <div style={{ aspectRatio: '1', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border)' }}>
            {product.images?.[activeImg]?.url
              ? <img src={product.images[activeImg].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>🖼️</div>
            }
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width: '72px', height: '72px', border: `2px solid ${i === activeImg ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden', cursor: 'pointer' }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="badge badge-default" style={{ marginBottom: '12px' }}>{product.category}</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <StarRating rating={product.ratings} />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 800 }}>₹{price.toLocaleString('en-IN')}</span>
            {hasDiscount && <span style={{ fontSize: '20px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.price.toLocaleString('en-IN')}</span>}
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>{product.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: product.stock === 0 ? 'var(--error)' : product.isLowStock ? 'var(--warning)' : 'var(--success)' }}>
              {product.stock === 0 ? '✗ Out of Stock' : product.isLowStock ? `⚠ Only ${product.stock} left!` : `✓ In Stock (${product.stock})`}
            </span>
          </div>

          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Qty:</span>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '8px 14px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '18px', cursor: 'pointer' }}>−</button>
                <span style={{ padding: '8px 16px', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ padding: '8px 14px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '18px', cursor: 'pointer' }}>+</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0 || cartLoading} style={{ flex: 1 }}>
              {cartLoading ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>

          {product.brand && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Brand: </span>
              <span style={{ fontWeight: 600 }}>{product.brand}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Reviews ({product.numReviews})</h2>

        {user && (
          <div className="card" style={{ marginBottom: '32px', maxWidth: '560px' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '20px' }}>Write a Review</h3>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <StarRating rating={review.rating} interactive onRate={(r) => setReview({ ...review, rating: r })} />
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-input" rows={4} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder="Share your experience..." required style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={reviewLoading}>{reviewLoading ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          </div>
        )}

        {product.reviews?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {product.reviews.map((r) => (
              <div key={r._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>{r.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;