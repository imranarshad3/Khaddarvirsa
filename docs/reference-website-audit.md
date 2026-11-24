# Reference Website Audit — kamaliakhaddar.pk

Audited 2026-11-23 in a real browser (desktop ~1024px and 375px mobile emulation).
Screenshots: `docs/screenshots/`. Raw data captured from the site's public JSON endpoints: `data/reference/`.

## 1. Technology observed

- Laravel backend + Vue 2 SPA (`/js/app.js`, `/js/chunks/*.js`), Bootstrap 3 grid, Font Awesome 4.7.
- The initial HTML is an empty shell (7.5 KB). All content comes from JSON endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /api/app/settings` | Top bar texts, sale title/colour (`#B70000`), shipping (Rs 200, free over Rs 2000), contacts |
| `GET /get_navigation` | Main categories → sub-categories (with status, meta title/description, banner image) |
| `GET /data/cat/main_category_products/{alias}` | Products of a main category grouped by sub-category |
| `GET /data/cat/category_products/{alias}` | Products of one sub-category |
| `GET /data/cat/rel_category_products/{alias}` | Related products |
| `GET /web_data/sliders`, `/web_data/featured_categories`, `/web_data/products` | Homepage hero slider, round category tiles, product rows |
| `GET /api/app/all_products_web` | Search index (id, title, code, alias, thumbnail) |
| `GET /web_data/youtube_videos` | "Watch our videos" strip |

Product record fields: `p_id, fk_sub_cat, alias, p_title, p_des, p_price, p_sale, p_img, p_code ("KL-305 Camel" = SKU + colour), status (2 = in stock, 3 = out of stock), on_sale_page, youtube_link`.

## 2. Page inventory (what actually exists)

| Page | URL | Exists |
|---|---|---|
| Home | `/` | Yes |
| Main category | `/main-category/{winter-unstitched, summer-unstitched, annan-sawa, shawls}` | Yes |
| Sub-category | `/product-category/{alias}` | Yes |
| Product detail | `/product/{alias}` | Yes |
| Sale page | `/today-sale` ("11.11 SALE" with HOT badge) | Yes |
| Cart | `/cart-detail` | Yes (full page, no drawer) |
| Checkout | `/checkout` | Yes (guest checkout only) |
| Locations | `/locations` | Yes |
| Blogs | `/blogs` | Yes |
| About, Contact, FAQ, Return policy, Terms, Privacy, Clients feedback | `/about-us`, `/contact`, `/faq`, `/return-policy`, `/terms`, `/privacy-policy`, `/clients_feedback` | Yes (footer links) |
| Customer account / login | — | **Not present** (no account icon, guest checkout) |
| Wishlist | — | **Not present** |
| Filters / sorting on category pages | — | **Not present** (products grouped by sub-category) |
| Pagination | — | **Not present** (all products rendered, images lazy-loaded) |
| Quick view | — | **Not present** |
| Reviews / ratings on products | — | **Not present** (site-wide "Clients Feedback" page instead) |

## 3. Global layout

### Top announcement bar
- Light grey strip, height 26px, 13px Helvetica Neue, colour `#7d7d7d`, centred.
- Texts separated by ` | `: "Its Sale Time up to 41% OFF!", truck icon + "Free Shipping on orders above Rs. 2000", WhatsApp icon + "+92 313 9129129" (links to wa.me).

### Header (desktop, ~211px tall, white)
- Left: square logo (gold crest "KK", 116×150 source), ~70px wide.
- Centre top: rounded search input "Search Product..." with magnifier, soft shadow, ~480px wide. Typing shows a live dropdown of matching products (thumbnail + title + code).
- Centre: menu links, uppercase, 12px, `#7d7d7d`, gap 20px: **11.11 SALE** (red, with red "HOT" speech-bubble badge above), HOME, WINTER KHADDAR, SUMMER KHADDAR, ANNAN SAWA, SHAWLS, LOCATIONS, BLOGS. Menu wraps to two lines at 1024px.
- Hovering a main category opens a dropdown of its sub-categories (only status-1 ones).
- Right: round white cart button with bag icon + count badge; social icons (Facebook, Instagram, YouTube, Twitter, TikTok, LinkedIn) as 30px white circles with shadow.

### Header (mobile ≤767px)
- Top bar wraps to 3 lines.
- Row: social icons left, payment logos (COD, BANK, VISA, Mastercard) and cart right.
- Dark row (`#333`): hamburger, search input (white, rounded), logo on the right.
- Hamburger opens a side drawer with the menu; main categories expand to sub-categories.

### Page banner (all inner pages)
- Full-width band ~52px high (desktop), `linear-gradient(80deg, #ffc63e, #000)`.
- Left: page title H3 24px/500 white. Right: breadcrumb "Home / Winter Khaddar" 16px white.
- Mobile: title and breadcrumb centred and stacked, band taller.

### Floating elements
- Bottom-right: Messenger and WhatsApp round buttons (fixed).
- Bottom-left: "recent order" social-proof toasts ("X bought Y, 10 minutes ago – City"). **Not reproduced**: they show real customers' names; we would have to fabricate them.

### Footer (background `#f3f3f3`)
1. "WATCH OUR VIDEOS" YouTube thumbnails strip.
2. Trust row: MONEY BACK GUARANTEE text, SECURE PAYMENTS / TRUSTED BRAND / EASY RETURNS.
3. ABOUT KAMALIA KHADDAR paragraph + outlet list | DOWNLOAD OUR APP (QR codes + Google Play / App Store badges).
4. Four columns: CONTACT US (address, email, phone, social icons) · CUSTOMER CARE · INFORMATION · NEWSLETTER SIGNUP (email + black Subscribe button, "Let's Get Connected" WhatsApp/Messenger).
5. Bottom bar: "Copyrights © 2026. Kamalia Khaddar All Rights Reserved." left; "Payment Methods" + COD/BANK/VISA/Mastercard right.

## 4. Main category page (`/main-category/winter-unstitched`)

- Banner: "Winter Khaddar" + breadcrumb.
- For each active sub-category: a grey heading bar (`#f3f3f3`, full width) with the sub-category name (18px bold, `#2e2e2e`) on the left and a → arrow linking to `/product-category/{alias}` on the right.
- Product grid: Bootstrap columns `col-lg-3 col-md-4 col-sm-6 col-xs-6` → 4 per row ≥1200px, 3 per row 992–1199px, **2 per row on tablet and mobile**. Container 1170 / 970 / 750px. 30px row gap.
- After the grids: a long SEO text block (H2/H3 headings, descriptions per sub-category, city list).
- Winter data captured: 6 sub-categories, 115 products (104 in stock, 11 out of stock).

## 5. Product card

| Part | Spec |
|---|---|
| Image box | Square 1:1 (`300x300_cover` source), card radius 5px, shadow `0 2px 4px rgba(0,0,0,.1)` |
| Sale ribbon | Top-left, 10px inset: "11.11 Sale", 12px bold white on `#B70000`, padding 3px 10px, radius 3px (only `on_sale_page` products) |
| Discount badge | Top-right, 10px inset: 50×50 red circle, "35%" / "OFF" two lines, 12px white |
| Out of stock | Card shows "Out Of Stock" overlay image; Add to bag / Buy now replaced by "Out Of Stock" |
| Add To Bag | Strip under the image inside the card: "+ Add To Bag", 12px black, centred; becomes a bag icon after adding |
| Title | 13px bold black, 15px below the card |
| Code / colour | 12px `#979797`: "KL-305 │ Camel" (thin divider) |
| Prices | Original 12px `#979797` struck through, "RS. 3590"; sale 12px bold `#B70000` "RS. 2350" |
| Buy Now | Right-aligned (left on mobile), `#2e2e2e` bg, white 12px, 1px black border, radius 5px, padding 2px 14px. Adds to cart and goes to checkout |
| Hover | Image link; no image swap |

## 6. Product detail page (`/product/{alias}`)

- Banner: sub-category name; breadcrumb Home / Main category / Sub-category.
- Two columns (image ~30% | info ~70% on desktop; stacked on mobile).
- **Gallery**: a single square image with a magnifier (zoom lens) icon bottom-left and fullscreen icon bottom-right. The data has one image per product (no extra images available).
- Info: title 30px/500 `#191919`; "PKR 2350.00" bold black + "PKR 3590.00" red struck through + black pill "35% OFF 😀".
- Rows: **Type:** sub-category · **Product Code:** KL-305 Camel · **Availability:** IN STOCK ✔ (green) · **Eligible for free shipping:** truck icon.
- Taglines: "COLOR GUARANTEE" / "HIGH QUALITY FABRIC" (quoted, 16px uppercase).
- **Description**: paragraph + bullet list (fabric, season, feel, comfort, length 7m × 1 yard). Comes from `p_des` with line breaks.
- Buttons: "Add to Cart" (outline `#c68d1e` gold, text gold → filled gold on hover) and "Buy it Now" (black). No quantity selector on this page (quantity changes in the cart).
- Payment logos row: COD, BANK, VISA, Mastercard.
- "Related Products" grey heading + product cards from the same sub-category.
- Toast on add: green "Product item added to cart." top-right.

## 7. Cart (`/cart-detail`)

- Panel "🛒 Shopping cart" with a bordered table: Remove (✖) · Image (thumbnail) · Product Name · Quantity (red − / gold number / green +) · Unit Price · Total.
- Totals table: Total Bill · Bundle Offer (`*Extra Discount!`) · Shipping Charges (`*Free Shipping on orders above Rs. 2000!`) · Final Bill.
- "Proceed To Checkout" blue button (`#2879fe`) bottom-right.
- Cart is stored client-side (survives reload).

## 8. Checkout (`/checkout`)

- Left column panels: **Your Personal Details** (Your Name*, E-Mail (optional), Mobile*), **Your Address** (City*, Address*), **Payment Method** (radio: Cash on Delivery · Pay Online (Visa / Mastercard / Bank) · Direct Bank Transfer).
- Right column: the same cart table + totals, **Remarks** (optional textarea), confirm order button.
- Guest checkout; no login.

## 9. Homepage

1. Full-width hero slider (4 slides, ~1920×650 banners).
2. Urdu wordmark "کمالیہ کھدر" image, centred.
3. Round featured-category tiles (circle images + name), horizontally scrolling.
4. One section per featured sub-category: heading + row of product cards + view-all arrow.
5. "Experience Kamalia Khaddar" TVC video.
6. Footer (above).

## 10. Design tokens

| Token | Value |
|---|---|
| Font | `"Helvetica Neue", Helvetica, Arial, sans-serif` (headings same family) |
| Body | 13px / 25px, `#7d7d7d` |
| Headings | weight 500, line-height 1.1; h1 25, h2 20, h3 18, h4 15 |
| Dark text | `#000`, `#191919`, `#2e2e2e` |
| Muted text | `#979797` |
| Sale red | `#B70000` |
| Gold accent | `#c68d1e`, `#ab7d28`, banner `#ffc63e` |
| Link hover | `#ff5e00` |
| Light background | `#f3f3f3` (section bars, footer) |
| Primary button (checkout) | `#2879fe`, radius 6px, 40px high |
| Card shadow | `0 2px 4px rgba(0,0,0,.1)`, radius 5px |
| Breakpoints | Bootstrap 3: 768 / 992 / 1200; containers 750 / 970 / 1170 |
| Transitions | colour .3s on links, .5s on detail buttons; no big animations |

## 11. Interactions tested

| Interaction | Result |
|---|---|
| Category dropdowns | Hover shows sub-categories |
| Search | Live dropdown from the product index |
| Add to Bag (card) | Adds 1, toast, header count increments, icon changes |
| Add to Cart (detail) | Adds, toast, button shows the added state |
| Cart quantity −/+ / remove | Updates totals instantly |
| Shipping rule | Rs 200, free when subtotal ≥ Rs 2000 |
| Proceed to checkout | Opens the checkout form (no order was placed during the audit) |
| Mobile menu | Hamburger drawer with collapsible categories |

## 12. Deliberate differences in the rebuild

- No fake "X bought Y" toasts (they would be fabricated).
- No app-store QR codes (we don't own the apps). Links to the real stores are kept.
- "Pay Online" is shown only when a gateway is configured; COD and Direct Bank Transfer work without one.
- Sorting and a simple filter are added on sub-category pages (requested by the brief; not on the reference). They are kept small so the page still looks like the reference.
