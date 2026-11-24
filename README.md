# Khaddar Virsa — online store

A premium khaddar store branded as Khaddar Virsa (brand details from khaddarvirsa.store), with the catalogue imported from kamaliakhaddar.pk, as one Next.js app with its own database and admin panel.

- **Storefront:** home, main categories, collections with sort and in-stock filtering, product pages, today's sale, search, cart, checkout, order confirmation, contact and content pages.
- **Orders:** checkout supports Cash on Delivery and Direct Bank Transfer. The server re-prices every order, checks stock and saves it in one transaction. Delivery charges and the free-delivery threshold come from settings. Discount codes are supported.
- **Admin (`/admin`):** dashboard, orders (status and internal note; cancelling returns stock), products (create, edit, image upload, bulk price and stock edits), categories and collections, customers (built from orders), discount codes, homepage slider, settings and SEO, content pages, newsletter subscribers.
- **SEO:** per-page metadata and canonical URLs, Product / Organization / Breadcrumb JSON-LD, `sitemap.xml`, `robots.txt`.

## Requirements

- Node.js **20.9 or newer** (developed on 22; `.nvmrc` says 22). Node 18 cannot load the Tailwind CSS 4 toolchain.
- A server with a writable disk for the SQLite database and uploaded images. This rules out serverless hosts with read-only or ephemeral disks (e.g. a default Vercel deploy): use a VPS, a container with a volume, or similar.

## Run it

```bash
nvm use
```

```bash
npm install
```

```bash
cp .env.example .env.local
```

Then set `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env.local` (see below).

```bash
npm run dev
```

The first request creates `data/store.db` and fills it from `data/reference/*.json`: the 4 categories, collections, 358 products, store settings and slider captured from the current website. An existing database is never re-seeded or overwritten.

Production:

```bash
npm run build && npm start
```

Checks: `npm run lint`, `npm run typecheck`, `npm test` (pricing and totals rules).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `SITE_URL` | yes in production | Public URL, no trailing slash. Used for canonical links, sitemap and JSON-LD. |
| `ADMIN_PASSWORD` | for admin | Admin login password. The admin panel stays disabled until this and `SESSION_SECRET` are set. |
| `SESSION_SECRET` | for admin | At least 32 random characters; signs the admin session cookie. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Changing it logs everyone out. |
| `DATABASE_PATH` | no | SQLite file, default `./data/store.db`. |
| `UPLOAD_DIR` | no | Folder for admin-uploaded images, default `./data/uploads` (served at `/uploads/...`). |
| `REFERENCE_IMAGE_BASE` | no | Where imported catalogue images are loaded from, default `https://kamaliakhaddar.pk/image/upload`. |

No secrets are committed. `.env.local`, the database and uploads are git-ignored.

**Back up** `data/store.db` (and its `-wal` file, or use `sqlite3 data/store.db ".backup backup.db"`) and the uploads folder: they hold all orders and edits.

## Security notes

- Every admin page and every admin server action checks the signed, httpOnly session cookie on the server (`requireAdmin()` in `src/lib/auth.ts`).
- Login is limited to 5 failed attempts per IP per 15 minutes. The counter is in memory, so it resets on restart and isn't shared between processes.
- Uploads are checked by their real file bytes (JPG/PNG/WebP/GIF only, 5 MB max) and saved under random names.
- Prices, discounts, delivery charges and stock are always recalculated on the server; the cart in the browser is only a list of product IDs and quantities.

## Project layout

```
src/lib/          db (schema + seed), catalog, orders, pricing (+ test), settings, auth, uploads
src/app/(shop)/   storefront pages
src/app/admin/    login, admin pages ((panel)/), admin server actions (actions.ts)
src/app/actions.ts  storefront server actions: cart quote, place order, search, newsletter
src/components/   layout, cart and product components
data/reference/   catalogue snapshot used for the first-run seed
docs/             reference audit, requirements, final report
```

See [docs/final-report.md](docs/final-report.md) for what differs from the reference site, what is not included, and open questions.
