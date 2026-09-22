import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { ProductCard } from '../components/ui';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [meta, setMeta] = useState({ categories: [], brands: [], price: { min: 0, max: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products/meta').then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams(params);
    if (!qs.get('limit')) qs.set('limit', '8');
    setLoading(true);
    api(`/products?${qs.toString()}`)
      .then((result) => {
        setData(result);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params]);

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }

  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const title = q ? `Results for “${q}”` : category || 'The full edit';

  return (
    <div className="wrap shop-layout">
      <aside className="filters">
        <div>
          <p className="eyebrow">Category</p>
          <div className="chip-list">
            <button className={`chip ${!category ? 'on' : ''}`} type="button" onClick={() => setParam('category', '')}>
              All
            </button>
            {meta.categories.map((item) => (
              <button
                key={item.name}
                className={`chip ${category === item.name ? 'on' : ''}`}
                type="button"
                onClick={() => setParam('category', item.name)}
              >
                {item.name} {item.count}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>Brand</span>
          <select value={params.get('brand') || ''} onChange={(event) => setParam('brand', event.target.value)}>
            <option value="">All houses</option>
            {meta.brands.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>
        </label>
        <div className="grid-2">
          <label className="field">
            <span>Min ₹</span>
            <input
              type="number"
              value={params.get('min') || ''}
              placeholder={meta.price.min || '0'}
              onChange={(event) => setParam('min', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Max ₹</span>
            <input
              type="number"
              value={params.get('max') || ''}
              placeholder={meta.price.max || ''}
              onChange={(event) => setParam('max', event.target.value)}
            />
          </label>
        </div>
        <button
          className={`chip ${params.get('rating') === '4' ? 'on' : ''}`}
          type="button"
          onClick={() => setParam('rating', params.get('rating') === '4' ? '' : '4')}
        >
          Rated 4 and up
        </button>
        {(category || q || params.get('brand') || params.get('min') || params.get('rating')) && (
          <button className="btn-line" type="button" onClick={() => setParams(new URLSearchParams())}>
            Clear filters
          </button>
        )}
      </aside>
      <section>
        <div className="toolbar">
          <div>
            <p className="eyebrow">{loading ? 'Looking' : `${data.total} pieces`}</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.3rem)' }}>{title}</h1>
          </div>
          <select value={params.get('sort') || 'newest'} onChange={(event) => setParam('sort', event.target.value)} aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="popular">Most reviewed</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
          </select>
        </div>
        {error && <p className="alert">{error}</p>}
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="skeleton" key={index} />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="empty">
            <h2>Nothing on this rail.</h2>
            <p>Try another word, or clear the filters.</p>
          </div>
        ) : (
          <div className="product-grid">
            {data.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        {data.pages > 1 && (
          <div className="pager">
            {Array.from({ length: data.pages }).map((_, index) => (
              <button
                key={index}
                className={data.page === index + 1 ? 'on' : ''}
                type="button"
                onClick={() => setParam('page', String(index + 1))}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
