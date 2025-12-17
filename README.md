## Title: Cloud-application end of semester exam project for L400 Computer Science

## Name: Farima Konaré

## Roll number: 10012200004

## Project: Panaya E-Commerce Web App

**Panaya** is a modern web platform for a natural juice and cereal brand. It gives shoppers a friendly storefront to browse drinks, manage their carts, place orders, upload payment proof, and track shipments. At the same time, staff can log into an admin console to manage products, categories, users, reviews, payments, and deliveries—all from one place.

- **Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, Neon Postgres (hosted on Vercel).
- **Structure:** `src/app/shop/*` handles the public storefront; `src/app/admin/*` handles internal operations; `/api/*` exposes the REST endpoints.

### Live Demo
https://panaya-products.vercel.app

https://panaya-products.vercel.app/shop

https://panaya-products.vercel.app/admin

### Test Logins
| Role | Email | Password |
| --- | --- | --- |
| Shopper | `rima@gmail.com` | `rima` |
| Admin | `admin@gmail.com` | `1234` |

### Core Features
#### Shopper Experience
- Browse featured drinks and cereal products, filter/search catalog items, and see full product details.
- Add items to cart, adjust quantities, and view running totals (including shipping).
- Place orders, upload payment proof, and track delivery status (Pending → Processing → Shipped → Completed).
- Write product reviews and see previous orders in the “My Purchases” dashboard.

#### Admin Console
- Manage inventory: create/edit/delete products, categories, and images.
- View/approve orders, verify payment receipts, and trigger shipment updates with event logs.
- Oversee users, reviews, payments, and shipments in dedicated admin tabs.

### API Highlights
- `GET /api/products` – list products with categories, stock, and pricing.
- `POST /api/products` – admin-only creation of new catalog items.
- `POST /api/auth/admin` – admin authentication.
- `GET /api/orders?userId=` – fetch shopper orders with items, payment, and shipment data.
- `PUT /api/payments/:id` – approve/reject payments, update statuses.
- `POST /api/shipment-events` – log shipment milestones.

See `src/app/api/*` for the full set of endpoints (products, categories, carts, orders, payments, shipments, users, reviews, cart items).

### Development
```bash
git clone https://github.com/farimakonare/ca_10012200004
cd cartzie-e-commerce
npm install
cp .env.example .env   # or create .env and set DATABASE_URL
npx prisma migrate dev
npm run dev
```
Open http://localhost:3000.

### Deployment & CI
- Hosted on Vercel with Neon Postgres as the managed database.
- GitHub Actions workflow (`.github/workflows/main.yml`) runs on every push/PR:
  1. `npm ci`
  2. `npm run lint`
  3. `npm run build`
- Set `DATABASE_URL` in repository secrets for CI and in Vercel Environment Variables for production.

### Supporting Materials
- **Postman Screenshots:** Capture successful calls such as `GET /api/products`, `POST /api/auth/admin`, and `POST /api/products`.
- **Monitoring Screenshot:** Screenshot the Vercel dashboard or Web Analytics page showing traffic for your report.

Panaya demonstrates a complete e-commerce flow—from browsing products to managing back-office workflows—in a single Next.js + Prisma project. Enjoy customizing it for your own brand!***
