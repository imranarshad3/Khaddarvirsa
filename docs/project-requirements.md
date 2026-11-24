# Project requirements

Source: the master prompt supplied by the client in chat ("rebuild the Kamalia Khaddar website", reference page `/main-category/winter-unstitched`).

**Audio notes:** the client also sent three audio files. They then said not to transcribe them ("dont transcript them"), so the audio was not transcribed and anything said only in it is not reflected here. Send the key points as text if they add requirements.

## Must have

| Requirement | Status |
|---|---|
| Storefront components: announcement bar, header, desktop and mobile navigation, search overlay, cart drawer, breadcrumbs, category banner and navigation, product grid and card, gallery, details, quantity selector, price display, sale badge, filter and sort, related products, newsletter, footer | Done |
| Real product catalogue | Done: seeded from the live site's public data (358 products, prices, sale prices, codes, descriptions, stock flag) |
| Cart and checkout: name, phone, email, address, city, delivery charges, COD, order placement and confirmation, with no fake API | Done: orders are stored in SQLite and visible in the admin |
| Admin with server-side auth: products, categories, collections, images, pricing, inventory, orders, customers, discounts, homepage content, SEO | Done |
| Responsive 360–1920 px | Done; spot-checked at 375 px and desktop |
| SEO: metadata, JSON-LD, sitemap, robots | Done |
| Tests, README, env docs, final report | Done (pricing self-test; manual browser test of the order flow) |

## Constraints (from the prompt)

- No hardcoded secrets; credentials only through environment variables.
- Never overwrite existing production data: the seed runs only when the database is empty.
- No pretend payment gateway: only COD and manual bank transfer are offered. Online card payment is not built and the card logos are hidden.
- No invented stock levels, reviews, specifications or prices: all catalogue data comes from the reference site; stock quantities are "not tracked" until the admin enters them; there are no reviews.
- All admin operations are authorised on the server.
