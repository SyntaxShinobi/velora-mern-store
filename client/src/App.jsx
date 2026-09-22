import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout, { OrderSuccess } from './pages/Checkout';
import Auth from './pages/Auth';
import Account, { OrderPage, WishlistPage } from './pages/Account';
import About from './pages/About';
import { AdminLayout, AdminOrders, AdminProducts, Dashboard, ProductForm } from './pages/Admin';

function Protected({ children, admin = false }) {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (admin && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function NotFound() {
  return (
    <section className="wrap empty">
      <p className="eyebrow">404</p>
      <h2>That page has left the studio.</h2>
      <p>The link may be old, or the piece was never on the rail.</p>
      <a className="btn" href="/shop">
        Back to the shop
      </a>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <Protected>
              <Checkout />
            </Protected>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <Protected>
              <OrderSuccess />
            </Protected>
          }
        />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route
          path="/account"
          element={
            <Protected>
              <Account />
            </Protected>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <Protected>
              <OrderPage />
            </Protected>
          }
        />
        <Route
          path="/wishlist"
          element={
            <Protected>
              <WishlistPage />
            </Protected>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="/admin"
        element={
          <Protected admin>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>
    </Routes>
  );
}
