import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import { addItem, pushToast, setUser } from '../store';
import { ProductCard, Qty, SWATCH, Stars, inr } from '../components/ui';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [formError, setFormError] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    setData(null);
    setActive(0);
    setQty(1);
    setFormError('');
    api(`/products/${slug}`)
      .then((result) => {
        setData(result);
        setSize(result.product.sizes?.[0] || '');
        setColor(result.product.colors?.[0] || '');
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return (
      <section className="wrap empty">
        <h2>We could not find that piece.</h2>
        <p>{error}</p>
        <Link className="btn" to="/shop">
          Return to shop
        </Link>
      </section>
    );
  }
  if (!data) return <section className="wrap" style={{ padding: '2rem 0' }}><div className="skeleton" /></section>;

  const { product, reviews, related } = data;
  const wished = (user?.wishlist || []).some((item) => (item.id || item) === product._id || item.slug === product.slug);
  const images = product.images?.length ? product.images : ['/placeholder.svg'];

  function addToBag() {
    if (product.sizes?.length && !size) return setFormError('Choose a size.');
    if (product.colors?.length && !color) return setFormError('Choose a colour.');
    if (product.stock <= 0) return setFormError('This piece is sold out.');
    dispatch(
      addItem({
        product: product._id,
        name: product.name,
        image: images[0],
        price: product.price,
        qty,
        size,
        color,
        stock: product.stock,
        slug: product.slug,
      })
    );
    dispatch(pushToast(`${product.name} added to bag`));
    setFormError('');
  }

  async function toggleWish() {
    if (!token) return navigate('/login');
    try {
      const result = await api(`/auth/wishlist/${product._id}`, { method: 'POST', token });
      dispatch(setUser(result.user));
      dispatch(pushToast(result.added ? 'Saved to wishlist' : 'Removed from wishlist'));
    } catch (err) {
      dispatch(pushToast(err.message));
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    setReviewNote('');
    try {
      const result = await api(`/products/${product._id}/reviews`, { method: 'POST', token, body: review });
      setData((current) => ({ ...current, product: result.product, reviews: result.reviews }));
      setReview({ rating: 5, comment: '' });
      setReviewNote('Thank you. The note is on the piece.');
    } catch (err) {
      setReviewNote(err.message);
    }
  }

  return (
    <div className="wrap">
      <p className="eyebrow" style={{ paddingTop: '1.2rem' }}>
        <Link to="/shop">Shop</Link> / {product.category} / {product.brand}
      </p>
      <section className="pdp">
        <div className="gallery">
          <img
            src={images[active]}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src = '/placeholder.svg';
            }}
          />
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, index) => (
                <button key={src} className={index === active ? 'on' : ''} type="button" onClick={() => setActive(index)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="buybox">
          <p className="eyebrow">{product.brand}</p>
          <h1>{product.name}</h1>
          <div className="card-meta">
            <Stars value={product.rating} />
            <span className="muted">{product.numReviews} reviews</span>
          </div>
          <p className="buy-price price">
            {inr(product.price)}
            {product.compareAtPrice > product.price && <s>{inr(product.compareAtPrice)}</s>}
          </p>
          <p>{product.description}</p>
          {product.colors?.length > 0 && (
            <div>
              <p className="eyebrow">Colour · {color}</p>
              <div className="swatches">
                {product.colors.map((item) => (
                  <button key={item} className={`swatch ${color === item ? 'on' : ''}`} type="button" onClick={() => setColor(item)}>
                    <i style={{ background: SWATCH[item] || '#ccc' }} />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.sizes?.length > 0 && (
            <div>
              <p className="eyebrow">Size</p>
              <div className="pills">
                {product.sizes.map((item) => (
                  <button key={item} className={`pill ${size === item ? 'on' : ''}`} type="button" onClick={() => setSize(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="buy-row">
            <Qty value={qty} max={Math.max(product.stock, 1)} onChange={setQty} />
            <button className="btn" type="button" onClick={addToBag} disabled={product.stock <= 0}>
              {product.stock <= 0 ? 'Sold out' : 'Add to bag'}
            </button>
            <button className="btn-ghost" type="button" onClick={toggleWish}>
              {wished ? 'Wishlisted' : 'Save'}
            </button>
          </div>
          {formError && <p className="alert">{formError}</p>}
          <p className="muted">{product.stock > 0 ? `${product.stock} in the studio` : 'Waitlist by saving it'} · SKU {product.sku}</p>
          <p className="details">{product.details}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>Notes from people who ordered it.</h2>
        </div>
        <div className="account-layout">
          <div className="review-list">
            {reviews.length === 0 && <p className="muted">No notes yet.</p>}
            {reviews.map((item) => (
              <article className="review" key={item._id}>
                <header>
                  <strong>{item.name}</strong>
                  <Stars value={item.rating} />
                </header>
                <p>{item.comment}</p>
              </article>
            ))}
          </div>
          <form className="panel form-grid" onSubmit={submitReview}>
            <p className="eyebrow">Leave a note</p>
            <h3>Verified purchase only.</h3>
            <p className="muted">Sign in and order this piece first. The server checks the order, not the button.</p>
            <label className="field">
              <span>Rating</span>
              <select value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Comment</span>
              <textarea
                value={review.comment}
                onChange={(event) => setReview({ ...review, comment: event.target.value })}
                placeholder="How does it wear, sit, or sound?"
              />
            </label>
            <button className="btn" type="submit" disabled={!token}>
              {token ? 'Publish note' : 'Sign in to review'}
            </button>
            {reviewNote && <p className={reviewNote.includes('Thank') ? 'ok' : 'alert'}>{reviewNote}</p>}
          </form>
        </div>
      </section>

      {related?.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2>In the same room.</h2>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
