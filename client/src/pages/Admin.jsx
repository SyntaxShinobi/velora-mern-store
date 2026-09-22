import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../api';
import { inr } from '../components/ui';

export function AdminLayout() {
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="admin">
      <aside>
        <Link to="/" className="logo">
          <i /> Velora
        </Link>
        <NavLink end to="/admin">
          Desk
        </NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/">Back to shop</NavLink>
        <p style={{ marginTop: 'auto', opacity: 0.7, padding: '0.7rem' }}>{user?.name}</p>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export function Dashboard() {
  const token = useSelector((state) => state.auth.token);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats', { token }).then(setStats).catch((err) => setError(err.message));
  }, [token]);

  if (error) return <p className="alert">{error}</p>;
  if (!stats) return <div className="skeleton" />;

  const max = Math.max(...stats.days.map((day) => day.total), 1);

  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">Desk</p>
          <h1 style={{ fontSize: '2.6rem' }}>This week in the studio.</h1>
        </div>
        <Link className="btn" to="/admin/products/new">
          Add a piece
        </Link>
      </div>
      <div className="stat-grid">
        <article className="stat"><span className="eyebrow">Revenue</span><b>{inr(stats.revenue)}</b></article>
        <article className="stat"><span className="eyebrow">Orders</span><b>{stats.orders}</b></article>
        <article className="stat"><span className="eyebrow">Customers</span><b>{stats.customers}</b></article>
        <article className="stat"><span className="eyebrow">Avg order</span><b>{inr(stats.aov)}</b></article>
      </div>
      <div className="admin-grid">
        <article className="panel">
          <p className="eyebrow">Seven days</p>
          <div className="bars">
            {stats.days.map((day) => (
              <div key={day.label}>
                <i style={{ height: `${Math.max((day.total / max) * 100, 6)}%` }} title={inr(day.total)} />
                <span>{day.label}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <p className="eyebrow">Status</p>
          {Object.entries(stats.byStatus).map(([name, count]) => (
            <div className="stat-row" key={name} style={{ marginTop: '0.45rem' }}>
              <span>{name}</span>
              <strong>{count}</strong>
            </div>
          ))}
          <p className="eyebrow" style={{ marginTop: '1rem' }}>Low stock</p>
          {stats.lowStock.map((product) => (
            <div className="stat-row" key={product._id}>
              <span>{product.name}</span>
              <strong>{product.stock}</strong>
            </div>
          ))}
        </article>
      </div>
      <article className="panel" style={{ marginTop: '0.8rem' }}>
        <p className="eyebrow">Recent orders</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.user?.name}</td>
                  <td>{order.status}</td>
                  <td>{inr(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}

export function AdminProducts() {
  const token = useSelector((state) => state.auth.token);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  function load() {
    api('/admin/products', { token }).then((data) => setItems(data.items)).catch((err) => setError(err.message));
  }
  useEffect(load, [token]);

  async function remove(id) {
    if (!window.confirm('Remove this product from the catalog?')) return;
    await api(`/admin/products/${id}`, { method: 'DELETE', token });
    load();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 style={{ fontSize: '2.4rem' }}>Products</h1>
        </div>
        <Link className="btn" to="/admin/products/new">
          New product
        </Link>
      </div>
      {error && <p className="alert">{error}</p>}
      <article className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img src={product.images?.[0] || '/placeholder.svg'} alt="" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{inr(product.price)}</td>
                  <td>{product.stock}</td>
                  <td className="mini-actions">
                    <Link to={`/admin/products/${product._id}`}>Edit</Link>
                    <button type="button" onClick={() => remove(product._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}

const BLANK = {
  name: '',
  brand: '',
  category: 'Apparel',
  price: '',
  compareAtPrice: '',
  stock: 10,
  description: '',
  details: '',
  images: '',
  sizes: '',
  colors: '',
  tags: '',
  sku: '',
  featured: false,
  justIn: false,
};

export function ProductForm() {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/admin/products/${id}`, { token })
      .then(({ product }) =>
        setForm({
          ...BLANK,
          ...product,
          images: (product.images || []).join('\n'),
          sizes: (product.sizes || []).join(', '),
          colors: (product.colors || []).join(', '),
          tags: (product.tags || []).join(', '),
        })
      )
      .catch((err) => setError(err.message));
  }, [id, token]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const path = id ? `/admin/products/${id}` : '/admin/products';
      await api(path, { method: id ? 'PUT' : 'POST', token, body: form });
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">{id ? 'Edit' : 'New'}</p>
          <h1 style={{ fontSize: '2.4rem' }}>{id ? 'Update piece' : 'Add a piece'}</h1>
        </div>
      </div>
      <form className="panel form-grid" onSubmit={save}>
        <div className="grid-2">
          <label className="field"><span>Name</span><input value={form.name} onChange={(e) => update('name', e.target.value)} required /></label>
          <label className="field"><span>Brand</span><input value={form.brand} onChange={(e) => update('brand', e.target.value)} required /></label>
        </div>
        <div className="grid-2">
          <label className="field">
            <span>Category</span>
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              {['Apparel', 'Footwear', 'Accessories', 'Home', 'Audio', 'Beauty'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field"><span>SKU</span><input value={form.sku || ''} onChange={(e) => update('sku', e.target.value)} /></label>
        </div>
        <div className="grid-2">
          <label className="field"><span>Price</span><input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required /></label>
          <label className="field"><span>Compare-at price</span><input type="number" value={form.compareAtPrice || ''} onChange={(e) => update('compareAtPrice', e.target.value)} /></label>
        </div>
        <label className="field"><span>Stock</span><input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} /></label>
        <label className="field"><span>Description</span><textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
        <label className="field"><span>Details</span><textarea value={form.details} onChange={(e) => update('details', e.target.value)} /></label>
        <label className="field"><span>Image URLs, one per line</span><textarea value={form.images} onChange={(e) => update('images', e.target.value)} /></label>
        <div className="grid-2">
          <label className="field"><span>Sizes, comma separated</span><input value={form.sizes} onChange={(e) => update('sizes', e.target.value)} /></label>
          <label className="field"><span>Colours, comma separated</span><input value={form.colors} onChange={(e) => update('colors', e.target.value)} /></label>
        </div>
        <label className="field"><span>Tags</span><input value={form.tags} onChange={(e) => update('tags', e.target.value)} /></label>
        <label className="checkline">
          <input type="checkbox" checked={!!form.featured} onChange={(e) => update('featured', e.target.checked)} /> Featured on the home edit
        </label>
        <label className="checkline">
          <input type="checkbox" checked={!!form.justIn} onChange={(e) => update('justIn', e.target.checked)} /> Mark as new
        </label>
        {error && <p className="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
      </form>
    </>
  );
}

export function AdminOrders() {
  const token = useSelector((state) => state.auth.token);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/orders', { token }).then((data) => setOrders(data.orders)).catch((err) => setError(err.message));
  }, [token]);

  async function updateStatus(id, status) {
    const data = await api(`/admin/orders/${id}/status`, { method: 'PUT', token, body: { status } });
    setOrders((current) => current.map((order) => (order._id === id ? data.order : order)));
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">Fulfilment</p>
          <h1 style={{ fontSize: '2.4rem' }}>Orders</h1>
        </div>
      </div>
      {error && <p className="alert">{error}</p>}
      <article className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>
                    {order.user?.name}
                    <br />
                    <span className="muted">{order.user?.email}</span>
                  </td>
                  <td>
                    {order.paymentMethod}
                    <br />
                    <span className="muted">{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                  </td>
                  <td>{inr(order.total)}</td>
                  <td>
                    <select value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)}>
                      {['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
