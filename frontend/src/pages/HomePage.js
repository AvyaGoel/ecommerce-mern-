import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const prodRes = await productAPI.getAll({ limit: 8, sort: '-sold' });
        const catRes = await productAPI.getCategories();

        const products = prodRes && prodRes.data && prodRes.data.products;
        const cats = catRes && catRes.data && catRes.data.categories;

        setFeatured(Array.isArray(products) ? products : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('HomePage load error:', err);
        setFeatured([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statItems = [
    { num: '10K+', label: 'Happy Customers' },
    { num: '500+', label: 'Products' },
    { num: '50+', label: 'Categories' },
    { num: '99%', label: 'Satisfaction Rate' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)', padding: '100px 0 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="badge badge-default" style={{ marginBottom: '24px', display: 'inline-flex' }}>
            Premium MERN Store
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,7vw,80px)', fontWeight: 800, lineHeight: 1.05, marginBottom: '24px' }}>
            Shop the Future
            <br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Today.
            </span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 40px' }}>
            Discover premium products with secure payments, real-time tracking, and effortless returns.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Get Started Free</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid-4">
            {statItems.map(function(item) {
              return (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: 'var(--accent-light)', marginBottom: '4px' }}>
                    {item.num}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>
              Shop by Category
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {categories.map(function(cat) {
                return (
                  <Link
                    key={cat}
                    to={'/products?category=' + encodeURIComponent(cat)}
                    className="btn btn-secondary"
                    style={{ borderRadius: '24px' }}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>
              Best Sellers
            </h2>
            <Link to="/products" className="btn btn-ghost">View All</Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading products..." />
          ) : featured.length > 0 ? (
            <div className="grid-4">
              {featured.map(function(p) {
                return <ProductCard key={p._id} product={p} />;
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛍</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '8px' }}>
                No products yet
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Add your first product from the admin dashboard
              </p>
              <Link to="/products" className="btn btn-primary">Browse Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>
            Ready to start shopping?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '17px' }}>
            Join thousands of happy customers today.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;