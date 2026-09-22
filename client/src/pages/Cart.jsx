import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import { removeItem, setCoupon, setQty } from '../store';
import { Empty, Qty, inr } from '../components/ui';

export function useQuote(items, coupon) {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      setError('');
      return undefined;
    }
    let live = true;
    setLoading(true);
    api('/orders/quote', {
      method: 'POST',
      body: {
        items: items.map((item) => ({
          product: item.product,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
        couponCode: coupon,
      },
    })
      .then((data) => {
        if (!live) return;
        setQuote(data);
        setError('');
      })
      .catch((err) => {
        if (!live) return;
        setError(err.message);
        setQuote(null);
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [items, coupon]);

  return { quote, error, loading };
}

export default function Cart() {
  const dispatch = useDispatch();
  const { items, coupon } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const [code, setCode] = useState(coupon || '');
  const { quote, error, loading } = useQuote(items, coupon);
  const pricing = quote?.pricing;

  if (!items.length) {
    return (
      <div className="wrap">
        <Empty title="The bag is empty." text="Eighteen pieces are waiting on the rail." action="Shop the edit" />
      </div>
    );
  }

  return (
    <div className="wrap cart-layout">
      <section>
        <p className="eyebrow">Bag</p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', marginBottom: '0.6rem' }}>What you are taking.</h1>
        {items.map((item) => (
          <article className="line" key={item.key}>
            <img src={item.image || '/placeholder.svg'} alt="" />
            <div>
              <h3>
                <Link to={`/product/${item.slug}`}>{item.name}</Link>
              </h3>
              <p className="muted">
                {[item.color, item.size].filter(Boolean).join(' · ') || 'One size'}
              </p>
              <div style={{ marginTop: '0.55rem' }}>
                <Qty value={item.qty} max={item.stock || 10} onChange={(qty) => dispatch(setQty({ key: item.key, qty }))} />
              </div>
            </div>
            <div className="line-side">
              <strong>{inr(item.price * item.qty)}</strong>
              <button className="btn-line" type="button" style={{ marginTop: '0.45rem' }} onClick={() => dispatch(removeItem(item.key))}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </section>
      <aside className="summary">
        <p className="eyebrow">Summary</p>
        <h2>Server total</h2>
        <form
          className="coupon-row"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch(setCoupon(code.trim().toUpperCase()));
          }}
        >
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Coupon" aria-label="Coupon code" />
          <button className="btn" type="submit">
            Apply
          </button>
        </form>
        <p className="muted">Try WELCOME10, STUDENT15, or VELORA20.</p>
        {loading && <p className="muted">Checking the desk…</p>}
        {error && <p className="alert">{error}</p>}
        {pricing && (
          <>
            <div className="summary-row"><span>Subtotal</span><span>{inr(pricing.subtotal)}</span></div>
            <div className="summary-row"><span>Discount</span><span>− {inr(pricing.discount)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{pricing.shipping ? inr(pricing.shipping) : 'Free'}</span></div>
            <div className="summary-row total"><span>Total</span><strong>{inr(pricing.total)}</strong></div>
            {pricing.coupon && <p className="ok">{pricing.coupon.code} applied. {pricing.coupon.label}</p>}
          </>
        )}
        <p className="muted">Prices include GST. Shipping is free over ₹2,999.</p>
        <Link className="btn btn-block" to={token ? '/checkout' : '/login'}>
          {token ? 'Checkout' : 'Sign in to checkout'}
        </Link>
      </aside>
    </div>
  );
}
