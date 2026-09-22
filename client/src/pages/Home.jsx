import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ProductCard, inr } from '../components/ui';

const FALLBACK = {
  Apparel: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
  Footwear: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80',
  Accessories: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  Home: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  Audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  Beauty: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/products/featured'), api('/products?sort=newest&limit=4'), api('/products/meta')])
      .then(([feat, newest, meta]) => {
        setFeatured(feat.items || []);
        setFresh(newest.items || []);
        setCategories(meta.categories || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function subscribe(event) {
    event.preventDefault();
    try {
      const data = await api('/auth/subscribe', { method: 'POST', body: { email } });
      setNote(data.message);
      setEmail('');
    } catch (err) {
      setNote(err.message);
    }
  }

  const hero = featured[0];

  return (
    <>
      <section className="hero wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">New season · considered goods</p>
            <h1 className="display">
              Wear the day
              <br />
              a little slower.
            </h1>
            <p className="lead">
              Linen, leather, brass, and a pair of headphones that stay out of the way. Velora is a small edit of
              everyday objects — and a full-stack shop you can walk a recruiter through.
            </p>
            <div className="hero-actions">
              <Link className="btn" to="/shop">
                Shop the edit
              </Link>
              <Link className="btn-ghost" to="/about">
                See the build
              </Link>
            </div>
            <p className="hero-note">Free shipping over ₹2,999 · 7-day returns on the story · Demo checkout</p>
          </div>
          <div className="hero-visual">
            {hero ? (
              <>
                <img src={hero.images?.[0]} alt={hero.name} />
                <Link className="float-card" to={`/product/${hero.slug}`}>
                  <span className="eyebrow">{hero.brand}</span>
                  <strong>{hero.name}</strong>
                  <span>{inr(hero.price)}</span>
                </Link>
              </>
            ) : (
              <div className="skeleton" />
            )}
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, index) => (
            <span key={index}>Linen · Leather · Brass · Wool · Ceramic · Handloom · Audio · Cotton · Neroli · Indigo · </span>
          ))}
        </div>
      </div>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Departments</p>
            <h2>Browse by rail and room.</h2>
          </div>
          <Link to="/shop">All pieces</Link>
        </div>
        {error && <p className="alert">{error}</p>}
        <div className="cat-grid">
          {categories.map((category) => (
            <Link className="cat-tile" key={category.name} to={`/shop?category=${encodeURIComponent(category.name)}`}>
              <img src={FALLBACK[category.name] || '/placeholder.svg'} alt="" />
              <span>
                {category.name}
                <small style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', letterSpacing: '0.08em' }}>
                  {category.count} pieces
                </small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">The edit</p>
            <h2>Pieces we would keep.</h2>
          </div>
          <Link to="/shop?sort=popular">Most loved</Link>
        </div>
        <div className="product-grid">
          {featured.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="band">
          <div className="band-copy">
            <p className="eyebrow" style={{ color: '#d7c4a3' }}>Studio note</p>
            <h2>Prices are checked again at the door.</h2>
            <p>
              The bag in your browser is a convenience. When you place an order, the server reads the live price, tests
              the coupon, and only then reserves stock. That is the difference between a tutorial cart and a shop.
            </p>
            <Link className="btn" to="/about" style={{ alignSelf: 'flex-start', background: '#f3efe8', color: '#1a1614' }}>
              Read the architecture
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80"
            alt="A quiet interior with warm light"
          />
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Just in</p>
            <h2>New to the rail.</h2>
          </div>
          <Link to="/shop?sort=newest">View new</Link>
        </div>
        <div className="product-grid">
          {fresh.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: '3rem' }}>
        <div className="quote-row">
          <article className="quote">
            <p className="eyebrow">From the desk</p>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>“Packed cleanly. Reached Varanasi in four days.”</h3>
            <p>Meera Iyer · Bengaluru, on the Handloom Day Kurta</p>
          </article>
          <article className="note-card">
            <p className="eyebrow">Try a code</p>
            <h3>STUDENT15</h3>
            <p>Fifteen percent off orders over ₹1,499, capped so the books still balance.</p>
          </article>
          <article className="note-card">
            <p className="eyebrow">Notes, not newsletters</p>
            <form onSubmit={subscribe} className="form-grid">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@college.ac.in"
                aria-label="Email"
                required
                style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '0.75rem 0.8rem' }}
              />
              <button className="btn" type="submit">
                Keep me posted
              </button>
              {note && <p>{note}</p>}
            </form>
          </article>
        </div>
      </section>
    </>
  );
}
