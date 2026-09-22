import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast } from '../store';
import { Icon } from './ui';

const LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=Apparel', label: 'Apparel' },
  { to: '/shop?category=Home', label: 'Home' },
  { to: '/shop?category=Audio', label: 'Audio' },
  { to: '/about', label: 'About' },
];

export default function Layout() {
  const { user } = useSelector((state) => state.auth);
  const items = useSelector((state) => state.cart.items);
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = setTimeout(() => dispatch(dismissToast(toasts[0].id)), 2800);
    return () => clearTimeout(timer);
  }, [toasts, dispatch]);

  function onSearch(event) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setQuery('');
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="announce">
          <span>Complimentary shipping across India on orders over ₹2,999</span>
          <span className="announce-note">Demo store · nothing is charged</span>
        </div>
        <div className="nav wrap">
          <button className="icon-btn menu-btn" type="button" aria-label="Open menu" onClick={() => setMenuOpen((v) => !v)}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
          <Link to="/" className="logo" aria-label="Velora home">
            <i />
            Velora
          </Link>
          <nav className="nav-links">
            {LINKS.map((link) => (
              <NavLink key={link.label} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <form className={`search ${searchOpen ? 'open' : ''}`} onSubmit={onSearch}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search linen, lamps, audio…"
                aria-label="Search products"
              />
            </form>
            <button className="icon-btn search-toggle" type="button" aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
              <Icon name="search" />
            </button>
            <Link className="icon-btn" to={user ? '/wishlist' : '/login'} aria-label="Wishlist">
              <Icon name="heart" />
            </Link>
            <Link className="icon-btn account-link" to={user ? '/account' : '/login'} aria-label="Account">
              <Icon name="user" />
              <span>{user ? user.name.split(' ')[0] : 'Sign in'}</span>
            </Link>
            {user?.role === 'admin' && (
              <Link className="admin-pill" to="/admin">
                Admin
              </Link>
            )}
            <Link className="icon-btn bag-btn" to="/cart" aria-label={`Bag, ${count} items`}>
              <Icon name="bag" />
              <em>{count}</em>
            </Link>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-panel wrap">
            {LINKS.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
            <Link to={user ? '/account' : '/login'}>{user ? 'Account' : 'Sign in'}</Link>
          </div>
        )}
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap foot-grid">
          <div>
            <p className="logo foot-logo">
              <i /> Velora
            </p>
            <p className="muted">
              A fictional lifestyle shop, built as a full MERN project. Prices are in rupees. Checkout is a demo — no
              payment is captured and nothing is shipped.
            </p>
          </div>
          <div>
            <p className="eyebrow">Visit</p>
            <Link to="/shop">The edit</Link>
            <Link to="/about">How it was built</Link>
            <Link to="/account">Orders</Link>
          </div>
          <div>
            <p className="eyebrow">Demo keys</p>
            <p>
              Customer
              <br />
              demo@velora.com
              <br />
              Demo@123
            </p>
            <p>
              Admin
              <br />
              admin@velora.com
              <br />
              Admin@123
            </p>
          </div>
          <div>
            <p className="eyebrow">Coupons</p>
            <p>WELCOME10 · STUDENT15 · VELORA20</p>
            <p className="muted">Server recalculates every total. The browser is not trusted with the price.</p>
          </div>
        </div>
        <div className="wrap foot-base">
          <span>© {new Date().getFullYear()} Velora studio. Portfolio project.</span>
          <span>Inclusive of GST · Ships as a story, not a parcel</span>
        </div>
      </footer>
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <button key={toast.id} className="toast" type="button" onClick={() => dispatch(dismissToast(toast.id))}>
            {toast.message}
          </button>
        ))}
      </div>
    </>
  );
}
