import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 12;

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('price[gte]') || '';
  const maxPrice = searchParams.get('price[lte]') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit, page };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      if (minPrice) params['price[gte]'] = minPrice;
      if (maxPrice) params['price[lte]'] = maxPrice;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [keyword, category, sort, minPrice, maxPrice, page]);

  useEffect(() => {
    productAPI.getCategories().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => { setPage(1); }, [keyword, category, sort]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{total} products found</p>
        </div>
        <input
          className="form-input"
          style={{ width: '280px' }}
          placeholder="🔍 Search products..."
          value={keyword}
          onChange={(e) => setParam('keyword', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Filters Sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setParam('category', '')}
              >All</button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setParam('category', cat)}
                >{cat}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Sort By</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[['', 'Newest'], ['-sold', 'Best Selling'], ['price', 'Price: Low → High'], ['-price', 'Price: High → Low'], ['-ratings', 'Top Rated']].map(([val, label]) => (
                <button key={val} className={`btn btn-sm ${sort === val ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setParam('sort', val)}>{label}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Price Range</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="form-input" placeholder="Min ₹" value={minPrice} onChange={(e) => setParam('price[gte]', e.target.value)} style={{ padding: '8px 10px' }} />
              <input className="form-input" placeholder="Max ₹" value={maxPrice} onChange={(e) => setParam('price[lte]', e.target.value)} style={{ padding: '8px 10px' }} />
            </div>
          </div>

          <button className="btn btn-secondary btn-sm btn-full" onClick={clearFilters}>Clear Filters</button>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? <LoadingSpinner text="Loading products..." /> : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '8px' }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid-3">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;