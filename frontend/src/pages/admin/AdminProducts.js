import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Modal = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

const ProductForm = ({ product, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: product?.name || '', description: product?.description || '', price: product?.price || '',
    discountedPrice: product?.discountedPrice || '', category: product?.category || '',
    brand: product?.brand || '', stock: product?.stock || '', lowStockThreshold: product?.lowStockThreshold || 10,
    tags: product?.tags?.join(', ') || '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      images.forEach((img) => fd.append('images', img));
      if (product) {
        await productAPI.update(product._id, fd);
        toast.success('Product updated!');
      } else {
        await productAPI.create(fd);
        toast.success('Product created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '18px' }}>{product ? 'Edit Product' : 'Add New Product'}</h2>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
      </div>
      <div className="grid-2">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Product Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Description *</label>
          <textarea className="form-input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Price (₹) *</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Discounted Price (₹)</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Brand</label>
          <input className="form-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Stock *</label>
          <input className="form-input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Low Stock Threshold</label>
          <input className="form-input" type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Tags (comma-separated)</label>
          <input className="form-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="electronics, gadget, sale" />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Product Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))}
            style={{ display: 'block', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', width: '100%' }} />
          {images.length > 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{images.length} file(s) selected</p>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}</button>
      </div>
    </form>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit, page };
      if (search) params.keyword = search;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{total} total products</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="🔍 Search by name or category..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: '260px' }} />
          <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>+ Add Product</button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                        {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px' }}>
                    ₹{(p.discountedPrice || p.price).toLocaleString('en-IN')}
                    {p.discountedPrice && <div style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.price.toLocaleString('en-IN')}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${p.stock === 0 ? 'badge-error' : p.isLowStock ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock === 0 ? 'Out of Stock' : p.isLowStock ? `Low: ${p.stock}` : p.stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{p.sold}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditProduct(p); setShowForm(true); }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No products found</div>
          )}
        </div>
      )}

      {total > limit && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span style={{ padding: '7px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {Math.ceil(total / limit)}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}

      <Modal show={showForm} onClose={() => setShowForm(false)}>
        <ProductForm product={editProduct} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchProducts(); }} />
      </Modal>
    </div>
  );
};

export default AdminProducts;
