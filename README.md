# Velora

Velora is a full-stack e-commerce web application built with the MERN stack, featuring dynamic product discovery, role-based authorization, and an end-to-end order processing lifecycle.

It is a small lifestyle shop (apparel, footwear, home, audio and a few everyday things) with prices in rupees. Users can browse, filter, add to cart, save a wishlist and place an order. There is a separate admin side to manage products and order status. I kept checkout as a demo on purpose, so the project can be cloned and tried without setting up a payment gateway.

## Tech stack

- **Frontend:** React, Redux Toolkit, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT, passwords hashed with bcrypt

## Features

- Register and login. Roles are `customer` and `admin`. A normal signup cannot create an admin account.
- Product listing with search, category, brand, price, rating, sort and pagination.
- Product page with size and colour, image gallery and reviews.
- Reviews are allowed only if that user has actually ordered the product.
- Cart is saved in the browser. Wishlist is saved on the user account.
- Coupon codes: `WELCOME10`, `STUDENT15`, `VELORA20`.
- Free shipping on orders of ₹2,999 and above, otherwise ₹99.
- Price, discount and stock are calculated again on the server when the order is placed. I did not trust the amount coming from the frontend.
- Order status flow: Placed, Packed, Shipped, Delivered. Customer can cancel while it is still Placed or Packed, and stock is added back.
- Admin dashboard with revenue, recent orders, low stock, product add/edit/delete and order status update.
- Responsive layout. Works on laptop and phone.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | demo@velora.com | Demo@123 |
| Admin | admin@velora.com | Admin@123 |

The customer account already has a saved address so checkout is faster to try. Payment options are UPI, card and cash on delivery. Card details stay in the browser. Nothing is actually charged.

## How to run

You need Node.js 18 or above.

```bash
cd velora
npm run install:all
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health

If `MONGODB_URI` is not set, the server starts an in-memory MongoDB and loads sample products, users and orders by itself. First start can take a minute because it downloads a MongoDB binary. This data is gone when you stop the server.

### Using MongoDB Atlas or local MongoDB

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGODB_URI` and change `JWT_SECRET`.
3. Start the server again. If the database is empty, sample data is inserted once.

```env
PORT=5000
JWT_SECRET=put-a-long-random-string-here
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/velora
```

## Project structure

```text
velora/
├── client/
│   ├── src/
│   │   ├── components/     header, footer, product card
│   │   ├── pages/          shop, product, cart, checkout, account, admin
│   │   ├── api.js
│   │   └── store.js        auth, cart, toasts
│   └── vite.config.js
└── server/
    └── src/
        ├── routes/         auth, products, orders, admin
        ├── models.js
        ├── seed.js         sample catalog and orders
        ├── pricing.js      coupon, shipping, stock check
        └── index.js
```

## API

| Method | Route | Who can call it |
| --- | --- | --- |
| POST | `/api/auth/register` | anyone |
| POST | `/api/auth/login` | anyone |
| GET | `/api/auth/me` | logged in user |
| PUT | `/api/auth/profile` | logged in user |
| POST | `/api/auth/wishlist/:productId` | logged in user |
| GET | `/api/products` | anyone |
| GET | `/api/products/:slug` | anyone |
| POST | `/api/products/:id/reviews` | user who ordered that product |
| POST | `/api/orders/quote` | anyone |
| POST | `/api/orders` | logged in user |
| GET | `/api/orders/mine` | logged in user |
| PUT | `/api/orders/:id/cancel` | owner of the order |
| GET | `/api/admin/stats` | admin |
| POST, PUT, DELETE | `/api/admin/products` | admin |
| PUT | `/api/admin/orders/:id/status` | admin |

## What I focused on

Most MERN cart tutorials stop at adding items in React state. I wanted the order part to behave a bit more like a real shop, so the backend reads the product price from MongoDB, checks the coupon rules, checks stock, then saves the order and reduces stock. Admin routes are blocked for normal users even if someone edits the request.

## Later I want to add

- Razorpay for actual payments, with signature check on the server
- Order confirmation mail
- Image upload from the admin form instead of pasting a URL
- Deploy the API and the React app separately (Render + Vercel) with Atlas

## Note

Product photos are loaded from Unsplash. If a photo fails, the page falls back to a placeholder. This is a demo store. No real parcel is shipped.
