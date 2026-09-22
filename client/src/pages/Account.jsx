import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import { logout, setUser } from '../store';
import { Empty, Stars, inr } from '../components/ui';

const FLOW = ['Placed', 'Packed', 'Shipped', 'Delivered'];

function moneyDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Account() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' });
  const [note, setNote] = useState('');

  useEffect(() => {
    api('/orders/mine', { token }).then((data) => setOrders(data.orders)).catch(() => {});
  }, [token]);

  async function save(event) {
    event.preventDefault();
    try {
      const body = { name: form.name, phone: form.phone };
      if (form.password) body.password = form.password;
      const data = await api('/auth/profile', { method: 'PUT', token, body });
      dispatch(setUser(data.user));
      setNote('Profile saved.');
      setForm((current) => ({ ...current, password: '' }));
    } catch (err) {
      setNote(err.message);
    }
  }

  return (
    <div className="wrap account-layout">
      <section>
        <p className="eyebrow">Account</p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>{user?.name}</h1>
        <p className="muted">{user?.email}</p>
        <div className="tabs">
          <span className="on">Orders</span>
          <Link to="/wishlist">Wishlist</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin desk</Link>}
        </div>
        {orders.length === 0 ? (
          <p className="muted">No orders yet. The demo customer already has a few — sign in as Rohan to see them.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <Link to={`/orders/${order._id}`}>{order.orderNumber}</Link>
                    </td>
                    <td>{moneyDate(order.createdAt)}</td>
                    <td>{order.status}</td>
                    <td>{inr(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <aside className="summary">
        <p className="eyebrow">Profile</p>
        <form className="form-grid" onSubmit={save}>
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={form.password}
              placeholder="Leave blank to keep"
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <button className="btn" type="submit">
            Save profile
          </button>
          {note && <p className="muted">{note}</p>}
        </form>
        <button
          className="btn-ghost"
          type="button"
          onClick={() => {
            dispatch(logout());
            navigate('/');
          }}
        >
          Sign out
        </button>
      </aside>
    </div>
  );
}

export function WishlistPage() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const items = user?.wishlist || [];

  async function remove(id) {
    const data = await api(`/auth/wishlist/${id}`, { method: 'POST', token });
    dispatch(setUser(data.user));
  }

  if (!items.length || typeof items[0] === 'string') {
    return (
      <div className="wrap">
        <Empty title="Nothing saved yet." text="Hearts on a product page live here, tied to your account." action="Find a piece" />
      </div>
    );
  }

  return (
    <section className="wrap" style={{ padding: '1.6rem 0 3rem' }}>
      <p className="eyebrow">Wishlist</p>
      <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '1rem' }}>Kept for later.</h1>
      <div className="product-grid">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <Link to={`/product/${item.slug}`} className="card-media">
              <img src={item.images?.[0] || '/placeholder.svg'} alt={item.name} />
            </Link>
            <div className="card-body">
              <p className="eyebrow">{item.category}</p>
              <h3>
                <Link to={`/product/${item.slug}`}>{item.name}</Link>
              </h3>
              <div className="card-meta">
                <span>{inr(item.price)}</span>
                <button className="btn-line" type="button" onClick={() => remove(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OrderPage() {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  function load() {
    api(`/orders/${id}`, { token })
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [id, token]);

  async function cancel() {
    try {
      const data = await api(`/orders/${id}/cancel`, { method: 'PUT', token });
      setOrder(data.order);
      setNote('Cancelled. Stock has been returned.');
    } catch (err) {
      setNote(err.message);
    }
  }

  if (error) return <section className="wrap empty"><h2>{error}</h2></section>;
  if (!order) return <section className="wrap" style={{ padding: '2rem 0' }}><div className="skeleton" /></section>;

  const step = FLOW.indexOf(order.status);

  return (
    <section className="wrap" style={{ padding: '1.4rem 0 3rem' }}>
      <p className="eyebrow">Order</p>
      <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>{order.orderNumber}</h1>
      <p className="muted">
        {moneyDate(order.createdAt)} · {order.paymentMethod} · {order.isPaid ? 'Paid (demo)' : 'Unpaid'}
      </p>
      {order.status === 'Cancelled' ? (
        <p className="alert" style={{ marginTop: '0.8rem' }}>This order was cancelled.</p>
      ) : (
        <div className="timeline">
          {FLOW.map((label, index) => (
            <span key={label} className={index <= step ? 'on' : ''}>
              {label}
            </span>
          ))}
        </div>
      )}
      <div className="account-layout">
        <div>
          {order.items.map((item, index) => (
            <article className="line" key={`${item.name}-${index}`}>
              <img src={item.image || '/placeholder.svg'} alt="" />
              <div>
                <h3>{item.name}</h3>
                <p className="muted">{[item.color, item.size].filter(Boolean).join(' · ') || 'One size'} · Qty {item.qty}</p>
              </div>
              <strong>{inr(item.price * item.qty)}</strong>
            </article>
          ))}
        </div>
        <aside className="summary">
          <p className="eyebrow">Ship to</p>
          <p>
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.phone}
          </p>
          <div className="summary-row"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
          <div className="summary-row"><span>Discount</span><span>− {inr(order.discount)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{order.shipping ? inr(order.shipping) : 'Free'}</span></div>
          <div className="summary-row total"><span>Total</span><strong>{inr(order.total)}</strong></div>
          {['Placed', 'Packed'].includes(order.status) && (
            <button className="btn-danger" type="button" onClick={cancel}>
              Cancel order
            </button>
          )}
          {note && <p className="muted">{note}</p>}
          <p className="muted" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <Stars value={5} /> A review unlocks after a non-cancelled order.
          </p>
        </aside>
      </div>
    </section>
  );
}
