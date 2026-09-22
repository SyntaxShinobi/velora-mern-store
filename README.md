# Velora

A resume-ready **MERN e-commerce** project for a B.Tech CSE student. It is a fictional Indian lifestyle shop — apparel, home, and audio — with a real order flow, not a static catalog.

Replace `[Your Name]` below with yours before you push this to GitHub.

**Author:** [Your Name] · B.Tech CSE  
**Stack:** MongoDB · Express · React · Node.js · Redux Toolkit · JWT

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Customer | `demo@velora.com` | `Demo@123` |
| Admin | `admin@velora.com` | `Admin@123` |

Coupons: `WELCOME10` (10% over ₹999), `STUDENT15` (15% over ₹1,499, cap ₹800), `VELORA20` (20% over ₹2,999, cap ₹1,500).

Checkout is a **demo**. Card numbers never leave the browser. UPI and card orders are marked paid inside the app. Nothing is charged and nothing is shipped.

## Run it

```bash
cd velora
npm run install:all
npm run dev
```

- Shop: http://localhost:5173
- API: http://localhost:5000/api/health

If `MONGODB_URI` is empty, the API starts an **in-memory MongoDB** and seeds the catalog. The first boot downloads a MongoDB binary (once). Data resets when the API process stops.

### Use a real database

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Copy `server/.env.example` to `server/.env`.
3. Set `MONGODB_URI` and a long `JWT_SECRET`.
4. Restart the API. An empty database is seeded automatically.

## What you can show in 5 minutes

1. Search “linen”, filter Apparel, sort by price.
2. Open a product, pick size and colour, add it to the bag.
3. Apply `STUDENT15`. The total comes from `POST /api/orders/quote`, not from React state.
4. Sign in as the customer (address in Lanka, Varanasi is already saved) and place a demo order.
5. Cancel it from the order page — stock is returned.
6. Sign in as admin. Change an order to Shipped. Add or edit a product.
7. Try to review a product you never ordered. The API returns 403.

## Features

- JWT auth, bcrypt passwords, customer vs admin roles
- Catalog search, category, brand, price, rating, sort, pagination
- Product variants (size, colour), reviews limited to verified purchases
- Persistent cart, wishlist, coupons, shipping rule (free over ₹2,999)
- Server-side price calculation and stock reservation
- Order lifecycle: Placed → Packed → Shipped → Delivered, plus cancel
- Admin desk: revenue, 7-day chart, low stock, product CRUD, order status
- Responsive storefront. Prices in INR.

## Architecture

```text
Browser (React + Redux)
    |  /api  via Vite proxy
Express
    |-- auth      register, login, profile, wishlist
    |-- products  list, filters, reviews
    |-- orders    quote, create, mine, cancel
    |-- admin     stats, products, orders
Mongoose
    users · products · reviews · orders · coupons · subscribers
```

The cart is client state on purpose. Interview line: *“I do not trust the client for money. Quote and checkout re-read Product documents, re-validate the coupon, then decrement stock in the same request.”*

## API

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` `/login` | public |
| GET | `/api/auth/me` | user |
| PUT | `/api/auth/profile` | user |
| POST | `/api/auth/wishlist/:productId` | user |
| GET | `/api/products` `/meta` `/featured` `/:slug` | public |
| POST | `/api/products/:id/reviews` | user, must have ordered it |
| POST | `/api/orders/quote` | public |
| POST | `/api/orders` | user |
| GET | `/api/orders/mine` `/:id` | user |
| PUT | `/api/orders/:id/cancel` | user |
| GET/POST/PUT/DELETE | `/api/admin/...` | admin |

## Resume bullets

Copy, then edit so they match what you personally changed.

- Built Velora, a full-stack e-commerce platform with the MERN stack, JWT authentication, and role-based access for customers and admins.
- Designed REST APIs for catalog search, filters, pagination, verified-purchase reviews, wishlists, coupons, and an order lifecycle with server-side price checks and stock reservation.
- Developed a responsive React storefront (Redux Toolkit) and an admin dashboard for product CRUD, order status updates, and sales summaries.
- Seeded a realistic INR catalog and demo accounts so the project can be cloned and run without manual data entry.

## Deploy (when you are ready)

- **API:** Render or Railway. Start command `npm start` inside `server`. Set `MONGODB_URI` and `JWT_SECRET`.
- **Client:** Vercel or Netlify. Set the Vite dev proxy only for local use. In production, point `fetch` at your API URL (add `VITE_API_URL` in `client/src/api.js` if you split hosts).
- **Database:** MongoDB Atlas. Allow the host IP, or `0.0.0.0/0` only while learning — tighten it later.

## Folder map

```text
velora/
  client/src          React storefront and admin desk
  server/src          Express app, models, routes, seed
  server/src/seed.js  Catalog, users, reviews, sample orders
```

## Honest limits

- Payments are simulated. The natural next step in India is Razorpay (order id on the server, signature check on the webhook). Do not claim Stripe or Razorpay unless you wire them.
- The in-memory database is for local demo. Atlas is what you deploy.
- Images are Unsplash URLs. Download them into `client/public` if you want the repo to work offline.

## Suggested GitHub topics

`mern` `ecommerce` `react` `express` `mongodb` `jwt` `redux-toolkit`
