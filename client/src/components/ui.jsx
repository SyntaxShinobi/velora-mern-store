import { Link } from 'react-router-dom';

export const SWATCH = {
  Sand: '#d7c4a3',
  Ink: '#1c1917',
  Olive: '#5c6b4a',
  Ivory: '#f4efe6',
  Indigo: '#1e3a5f',
  Charcoal: '#3f3f46',
  Oat: '#e6d3b3',
  Clay: '#c4785a',
  Black: '#161513',
  White: '#f7f5f2',
  Forest: '#1e3d34',
  Tan: '#c4a574',
  Madder: '#9f2d2d',
  Sage: '#8a9a7b',
  Steel: '#9aa0a6',
  Gold: '#c6a15b',
  Tortoise: '#8a5a32',
  Graphite: '#3d3d3d',
  Rust: '#a3442a',
};

export function inr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function Icon({ name, size = 20 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  const paths = {
    bag: (
      <>
        <path d="M6.5 8h11l-.8 12H7.3L6.5 8z" />
        <path d="M9 8V7.2A3 3 0 0 1 12 4a3 3 0 0 1 3 3.2V8" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16.5 20 20.5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.1" />
        <path d="M5.2 19.2c1.3-2.8 3.6-4.2 6.8-4.2s5.5 1.4 6.8 4.2" />
      </>
    ),
    heart: <path d="M12 19.4s-6.4-3.9-6.4-8.1a3.6 3.6 0 0 1 6.4-1.7 3.6 3.6 0 0 1 6.4 1.7c0 4.2-6.4 8.1-6.4 8.1z" />,
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h12" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
  };
  return <svg {...props}>{paths[name]}</svg>;
}

export function Stars({ value = 0 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className={n <= Math.round(value) ? 'on' : ''}>
          <path d="M12 3.2 14.6 8.7l6 .7-4.5 4 1.2 5.8L12 16.4 6.7 19.2 7.9 13.4 3.4 9.4l6-.7L12 3.2z" />
        </svg>
      ))}
    </span>
  );
}

export function ProductCard({ product }) {
  const sale = product.compareAtPrice > product.price;
  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card-media">
        {sale && <span className="flag">Sale</span>}
        {product.justIn && !sale && <span className="flag flag-new">New</span>}
        {product.stock <= 0 && <span className="flag flag-out">Sold out</span>}
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = '/placeholder.svg';
          }}
        />
      </Link>
      <div className="card-body">
        <p className="eyebrow">
          {product.category} · {product.brand}
        </p>
        <h3>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="card-meta">
          <p className="price">
            {inr(product.price)}
            {sale && <s>{inr(product.compareAtPrice)}</s>}
          </p>
          <Stars value={product.rating} />
        </div>
      </div>
    </article>
  );
}

export function Qty({ value, max = 10, onChange }) {
  return (
    <div className="qty">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity">
        −
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Empty({ title, text, action, to = '/shop' }) {
  return (
    <div className="empty">
      <p className="eyebrow">Velora</p>
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <Link className="btn" to={to}>
          {action}
        </Link>
      )}
    </div>
  );
}
