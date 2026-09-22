import { Link } from 'react-router-dom';

export default function About() {
  return (
    <article className="wrap" style={{ padding: '2rem 0 3.4rem', display: 'grid', gap: '1.2rem' }}>
      <p className="eyebrow">Portfolio note</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
        A shop, not a slideshow.
      </h1>
      <p className="lead">
        Velora is a fictional Indian lifestyle label and a MERN project built to sit on a B.Tech CSE resume. The
        storefront is the demo. This page is the explanation you can leave open beside it.
      </p>
      <div className="quote-row">
        <section className="note-card">
          <p className="eyebrow">Stack</p>
          <h3>MongoDB, Express, React, Node</h3>
          <p>React 18, Redux Toolkit, React Router, Vite on the client. Express, Mongoose, JWT, and bcrypt on the server.</p>
        </section>
        <section className="note-card">
          <p className="eyebrow">Trust boundary</p>
          <h3>The server owns the money.</h3>
          <p>Cart state lives in the browser. Price, coupon, stock, and role checks happen again in Express before an order exists.</p>
        </section>
        <section className="note-card">
          <p className="eyebrow">Access</p>
          <h3>Two doors.</h3>
          <p>Customers get orders and wishlist. Admins get the desk. Register cannot mint an admin, even if the body asks for one.</p>
        </section>
      </div>
      <section className="panel">
        <p className="eyebrow">What a walkthrough can show</p>
        <ul>
          <li>Search, filter, sort, and paginate the catalog.</li>
          <li>Choose size and colour, persist a bag, apply WELCOME10 or STUDENT15.</li>
          <li>Sign in as demo@velora.com / Demo@123 and place a UPI, card, or COD demo order.</li>
          <li>Open the order, cancel it while it is still Placed, and watch stock return.</li>
          <li>Sign in as admin@velora.com / Admin@123, edit a product, and move an order to Shipped.</li>
          <li>Try to review a product you have not bought — the API refuses.</li>
        </ul>
      </section>
      <section className="panel">
        <p className="eyebrow">Before you submit the resume</p>
        <p>
          Put your name, college, and GitHub on this page and in the README. Deploy the API to Render, the client to
          Vercel, and the data to MongoDB Atlas. The in-memory database is only so a recruiter can run <code>npm run dev</code>{' '}
          without installing Mongo.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
          <Link className="btn" to="/login">
            Open the demo
          </Link>
          <Link className="btn-ghost" to="/shop">
            Browse as a guest
          </Link>
        </div>
      </section>
    </article>
  );
}
