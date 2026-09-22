import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import { clearCart, setCoupon } from '../store';
import { inr } from '../components/ui';
import { useQuote } from './Cart';

const STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const EMPTY = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: 'Uttar Pradesh',
  postalCode: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { items, coupon } = useSelector((state) => state.cart);
  const [form, setForm] = useState(EMPTY);
  const [method, setMethod] = useState('UPI');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [code, setCode] = useState(coupon || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { quote, error: quoteError } = useQuote(items, coupon);

  useEffect(() => {
    if (!user) return;
    const address = user.addresses?.[0];
    setForm({
      ...EMPTY,
      fullName: address?.fullName || user.name || '',
      phone: address?.phone || user.phone || '',
      line1: address?.line1 || '',
      line2: address?.line2 || '',
      city: address?.city || '',
      state: address?.state || 'Uttar Pradesh',
      postalCode: address?.postalCode || '',
    });
  }, [user]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function place(event) {
    event.preventDefault();
    setError('');
    if (method === 'Card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length < 12 || card.name.length < 2 || card.expiry.length < 4 || card.cvv.length < 3) {
        setError('Enter demo card details. They stay in the browser and are never sent.');
        return;
      }
    }
    setBusy(true);
    try {
      const data = await api('/orders', {
        method: 'POST',
        token,
        body: {
          items: items.map((item) => ({
            product: item.product,
            qty: item.qty,
            size: item.size,
            color: item.color,
          })),
          couponCode: coupon,
          shippingAddress: form,
          paymentMethod: method,
        },
      });
      dispatch(clearCart());
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
    return (
      <section className="wrap empty">
        <h2>Nothing to check out.</h2>
        <Link className="btn" to="/shop">
          Shop the edit
        </Link>
      </section>
    );
  }

  const pricing = quote?.pricing;

  return (
    <form className="wrap check-layout" onSubmit={place}>
      <section>
        <p className="eyebrow">Checkout</p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>Where should it go?</h1>
        <p className="steps">
          <b>1 · Address</b>
          <span>2 · Demo payment</span>
          <span>3 · Place</span>
        </p>
        <div className="form-grid">
          <div className="grid-2">
            <label className="field">
              <span>Full name</span>
              <input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} required />
            </label>
            <label className="field">
              <span>Mobile</span>
              <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="9876543210" required />
            </label>
          </div>
          <label className="field">
            <span>Address</span>
            <input value={form.line1} onChange={(event) => update('line1', event.target.value)} placeholder="House, street, area" required />
          </label>
          <label className="field">
            <span>Landmark</span>
            <input value={form.line2} onChange={(event) => update('line2', event.target.value)} />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>City</span>
              <input value={form.city} onChange={(event) => update('city', event.target.value)} required />
            </label>
            <label className="field">
              <span>State</span>
              <select value={form.state} onChange={(event) => update('state', event.target.value)}>
                {STATES.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>PIN code</span>
            <input value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} required />
          </label>
        </div>

        <h2 style={{ margin: '1.4rem 0 0.6rem', fontSize: '2rem' }}>Demo payment</h2>
        <div className="pay-options">
          {[
            ['UPI', 'UPI', 'Simulated. Placing the order marks demo@velora as paid. No VPA is charged.'],
            ['Card', 'Card', 'Card numbers never leave this browser. The API only receives the method name.'],
            ['COD', 'Cash on delivery', 'Order is placed unpaid. Useful for showing the isPaid flag in the admin desk.'],
          ].map(([id, label, help]) => (
            <label key={id}>
              <input type="radio" name="pay" checked={method === id} onChange={() => setMethod(id)} />
              <span>
                <strong>{label}</strong>
                <br />
                <span className="muted">{help}</span>
              </span>
            </label>
          ))}
        </div>
        {method === 'Card' && (
          <div className="form-grid" style={{ marginTop: '0.8rem' }}>
            <label className="field">
              <span>Name on card</span>
              <input value={card.name} onChange={(event) => setCard({ ...card, name: event.target.value })} placeholder="Rohan Mehta" />
            </label>
            <label className="field">
              <span>Card number</span>
              <input value={card.number} onChange={(event) => setCard({ ...card, number: event.target.value })} placeholder="4242 4242 4242 4242" />
            </label>
            <div className="grid-2">
              <label className="field">
                <span>Expiry</span>
                <input value={card.expiry} onChange={(event) => setCard({ ...card, expiry: event.target.value })} placeholder="12/28" />
              </label>
              <label className="field">
                <span>CVV</span>
                <input value={card.cvv} onChange={(event) => setCard({ ...card, cvv: event.target.value })} placeholder="123" />
              </label>
            </div>
          </div>
        )}
        {method === 'UPI' && <p className="ok" style={{ marginTop: '0.8rem' }}>Demo VPA: pay@velora · reference is generated with the order.</p>}
        {(error || quoteError) && <p className="alert" style={{ marginTop: '0.8rem' }}>{error || quoteError}</p>}
      </section>
      <aside className="summary">
        <p className="eyebrow">To pay</p>
        {items.map((item) => (
          <div className="summary-row" key={item.key}>
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{inr(item.price * item.qty)}</span>
          </div>
        ))}
        <form
          className="coupon-row"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch(setCoupon(code.trim().toUpperCase()));
          }}
        >
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Coupon" aria-label="Coupon" />
          <button className="btn" type="button" onClick={() => dispatch(setCoupon(code.trim().toUpperCase()))}>
            Apply
          </button>
        </form>
        {pricing && (
          <>
            <div className="summary-row"><span>Discount</span><span>− {inr(pricing.discount)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{pricing.shipping ? inr(pricing.shipping) : 'Free'}</span></div>
            <div className="summary-row total"><span>Total</span><strong>{inr(pricing.total)}</strong></div>
          </>
        )}
        <button className="btn btn-block" type="submit" disabled={busy || !pricing}>
          {busy ? 'Placing…' : 'Place demo order'}
        </button>
        <p className="muted">Nothing is charged. Stock is reserved in MongoDB when this succeeds.</p>
      </aside>
    </form>
  );
}

export function OrderSuccess() {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api(`/orders/${id}`, { token }).then((data) => setOrder(data.order)).catch(() => {});
  }, [id, token]);

  return (
    <section className="wrap empty">
      <p className="eyebrow">Order placed</p>
      <h2>{order ? order.orderNumber : 'Confirmed.'}</h2>
      <p>
        {order
          ? `${order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Demo payment received'} · ${order.shippingAddress.city}. This is a portfolio order — no parcel will move.`
          : 'Fetching the receipt…'}
      </p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <Link className="btn" to={`/orders/${id}`}>
          View order
        </Link>
        <Link className="btn-ghost" to="/shop">
          Continue browsing
        </Link>
      </div>
    </section>
  );
}
