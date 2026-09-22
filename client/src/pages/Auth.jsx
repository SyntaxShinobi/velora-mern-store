import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, login, registerUser } from '../store';

export default function Auth({ mode = 'login' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, token, user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const isLogin = mode === 'login';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [mode, dispatch]);

  useEffect(() => {
    if (token && user) navigate(user.role === 'admin' ? '/admin' : '/account');
  }, [token, user, navigate]);

  async function submit(event) {
    event.preventDefault();
    const action = isLogin ? login({ email: form.email, password: form.password }) : registerUser(form);
    const result = await dispatch(action);
    const done = isLogin ? login.fulfilled.match(result) : registerUser.fulfilled.match(result);
    if (done) {
      const next = result.payload.user.role === 'admin' ? '/admin' : '/account';
      navigate(next);
    }
  }

  async function quick(email, password) {
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate(result.payload.user.role === 'admin' ? '/admin' : '/');
    }
  }

  return (
    <div className="wrap auth-wrap">
      <div className="auth-side">
        <p className="eyebrow">{isLogin ? 'Welcome back' : 'Open an account'}</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.6rem)' }}>
          {isLogin ? 'Sign in to the studio.' : 'A name, an email, a key.'}
        </h1>
        <p className="lead" style={{ marginTop: '0.8rem' }}>
          Passwords are hashed with bcrypt. The token is a JWT that lasts seven days. Admin routes refuse everyone else.
        </p>
        {isLogin && (
          <div className="demo-actions">
            <button className="btn" type="button" onClick={() => quick('demo@velora.com', 'Demo@123')}>
              Enter as Rohan (customer)
            </button>
            <button className="btn-ghost" type="button" onClick={() => quick('admin@velora.com', 'Admin@123')}>
              Enter as Aisha (admin)
            </button>
          </div>
        )}
      </div>
      <form className="auth-card form-grid" onSubmit={submit}>
        {!isLogin && (
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@college.ac.in"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="At least 6 characters"
            required
          />
        </label>
        {error && <p className="alert">{error}</p>}
        <button className="btn" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>
        <p className="muted">
          {isLogin ? (
            <>
              New here? <Link to="/register">Create an account</Link>
            </>
          ) : (
            <>
              Already registered? <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
