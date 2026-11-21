-- Rugistan becomes Khaddar Virsa: a Pakistani khaddar, fashion & shawls store.
-- Idempotent and non-destructive:
--   * rug products are archived (not deleted) so order history keeps its references;
--   * rug categories are deactivated, not deleted;
--   * banners, pages and settings are only rewritten while they still hold the original rug copy,
--     so anything the merchant has edited since is left alone;
--   * base currency is never touched.

-- ---------- categories ----------
insert into public.categories (name, slug, description, image_url, sort_order) values
('Premium Shawls','premium-shawls','Heritage shawls finished by hand','/assets/fashion/cat-premium-shawls.jpg',1),
('Winter Shawls','winter-shawls','Warm wraps for cold evenings','/assets/fashion/cat-winter-shawls.jpg',2),
('Embroidered Shawls','embroidered-shawls','Paisley, tilla and thread work','/assets/fashion/cat-embroidered-shawls.jpg',3),
('Luxury Shawls','luxury-shawls','Fine pashmina blends and statement pieces','/assets/fashion/cat-luxury-shawls.jpg',4),
('Women''s Clothing','womens-clothing','Everyday suits and pret','/assets/fashion/cat-womens-clothing.jpg',5),
('Casual Wear','casual-wear','Easy lawn and cotton for every day','/assets/fashion/cat-casual-wear.jpg',6),
('Formal Wear','formal-wear','Chiffon and organza for occasions','/assets/fashion/cat-formal-wear.jpg',7),
('Festive Collection','festive-collection','Celebration wear with zari and mirror work','/assets/fashion/cat-festive-collection.jpg',8),
('Classic Khaddar','classic-khaddar','Pure cotton Kamalia khaddar suit fabric','/assets/fashion/cotton-khaddi-kv-375-1.jpg',9)
on conflict (slug) do nothing;

update public.categories set is_active = false
 where slug in ('traditional-rugs','modern-rugs','solid-minimal','custom-rugs') and is_active;

-- ---------- products ----------
-- Field use: material = fabric, dimensions = size/length, weave_technique = embroidery/craft,
-- room = occasion, style = season, compare_at_price = original price when on sale.
with c as (select slug, id from public.categories),
v(name, slug, sku, cat, price, compare_at, stock, material, dimensions, craft, color, colors, occasion, season, featured, age_days, short_d, long_d) as (values
('Cotton Khaddi KV-375','cotton-khaddi-kv-375','KV-375','classic-khaddar',1699,3400::int,10,
 '100% Cotton Kamalia Khaddar','7 m length × 33 in width','Non-chemicalized Kamalia khaddar','Brown',
 '[{"name":"Brown","hex":"#6b5d52"}]','Everyday','Winter',true,0,
 '100% cotton, high-quality Kamalia khaddar: 7 metre length, 33 inch width.',
 E'Kamalia khaddar is a non-chemicalized fabric known for its lustre, durability and an intensely soft feel on the skin. Colour and stuff guaranteed.\n\nLightweight and easy to wear · Made from high-quality yarns · Guaranteed fabric colour · Free shipping, and you may open the parcel before accepting it.\n\nCare: hand wash cold separately; dry in shade.'),
('Royal Kashmiri Shawl','royal-kashmiri-shawl','RZ-S101','premium-shawls',8500,null,10,
 'Pure Wool','40 × 80 in','Hand-embroidered paisley border','Navy Blue',
 '[{"name":"Navy","hex":"#2f4a7a"},{"name":"Ivory","hex":"#ece4d4"},{"name":"Sky","hex":"#7fb2d6"}]','Formal','Winter',true,40,
 'A navy wool shawl framed by a hand-embroidered Kashmiri paisley border.',
 E'A generous wool shawl in deep navy, finished with a hand-embroidered paisley border in ivory and sky blue. Warm enough for winter evenings and refined enough for formal gatherings.\n\nCare: dry clean recommended. Store folded in a breathable cotton bag, away from direct sunlight.'),
('Noor Embroidered Shawl','noor-embroidered-shawl','RZ-S102','embroidered-shawls',6500,7500,12,
 'Wool Blend','36 × 80 in','Thread embroidery with tilla accents','Black',
 '[{"name":"Black","hex":"#1d1b1a"},{"name":"Silver Grey","hex":"#b9b6b0"}]','Formal','Winter',true,38,
 'A black wool-blend shawl with dense white thread embroidery across the field.',
 E'Classic black with an all-over floral embroidery in silver-white thread. It pairs easily with plain or printed suits and adds quiet polish to any winter outfit.\n\nCare: dry clean only. Do not wring; steam lightly on the reverse if needed.'),
('Velvet Winter Wrap','velvet-winter-wrap','RZ-S103','winter-shawls',7500,null,9,
 'Velvet-finish Wool','40 × 82 in','Woven paisley jacquard','Bottle Green & Rust',
 '[{"name":"Bottle Green","hex":"#24463a"},{"name":"Rust","hex":"#c0612b"}]','Everyday','Winter',true,36,
 'A soft, heavyweight wrap with a bold rust paisley on bottle green.',
 E'A heavyweight wrap with a soft velvet-like hand and a large woven paisley in rust and bottle green. Made to be worn every day through the cold months.\n\nCare: dry clean recommended. Air between wears and store folded.'),
('Zareen Luxury Shawl','zareen-luxury-shawl','RZ-S104','luxury-shawls',12500,14500,5,
 'Fine Pashmina Blend','42 × 84 in','Hand-embroidered Kashmiri motifs','Royal Blue',
 '[{"name":"Royal Blue","hex":"#1f5fbf"},{"name":"Turquoise","hex":"#3fb6c9"},{"name":"Gold","hex":"#c8a24a"}]','Festive','Winter',true,34,
 'A royal blue pashmina-blend shawl with rich hand embroidery in turquoise and gold.',
 E'Our statement shawl: a fine pashmina blend in royal blue, embroidered by hand with sweeping Kashmiri motifs and a contrast turquoise edge. A keepsake piece for weddings and festive evenings.\n\nCare: professional dry clean only. Store wrapped in muslin; avoid perfume directly on the embroidery.'),
('Ayesha Embroidered Suit','ayesha-embroidered-suit','RZ-C201','formal-wear',9500,null,0,
 'Chiffon & Organza','3-piece: shirt, trouser, dupatta','Resham thread embroidery','Black',
 '[{"name":"Black","hex":"#1b1a1c"},{"name":"Ivory","hex":"#efe9de"}]','Formal','All Season',true,32,
 'A black chiffon three-piece with ivory resham embroidery and a sheer embroidered dupatta.',
 E'A formal three-piece in black chiffon. The shirt carries ivory resham embroidery at the neckline and hem, paired with straight trousers and a sheer organza dupatta with a matching border.\n\nCare: dry clean only. Iron on low heat on the reverse side.'),
('Mahnoor Three-Piece Suit','mahnoor-three-piece-suit','RZ-C202','womens-clothing',7500,8500,0,
 'Lawn with Chiffon Dupatta','3-piece: shirt, trouser, dupatta','Thread embroidery','Crimson Red',
 '[{"name":"Crimson","hex":"#a3192b"}]','Everyday','Summer',true,30,
 'A crimson lawn three-piece with tonal embroidery and a soft chiffon dupatta.',
 E'Breathable lawn in a rich crimson, embroidered tone-on-tone on the front panel and sleeves. Finished with matching trousers and a lightweight chiffon dupatta.\n\nCare: gentle hand wash in cold water separately. Dry in shade; iron while slightly damp.'),
('Zara Festive Collection','zara-festive-collection','RZ-C203','festive-collection',11500,null,0,
 'Raw Silk & Chiffon','3-piece: shirt, trouser, dupatta','Mirror and zari work','Lilac',
 '[{"name":"Lilac","hex":"#a58bbf"},{"name":"Silver","hex":"#c9c9cf"}]','Festive','All Season',true,8,
 'A lilac festive three-piece with delicate zari and mirror detailing.',
 E'A celebration outfit in soft lilac. The raw silk shirt is detailed with fine zari and small mirror work, paired with a flowing chiffon dupatta and slim trousers.\n\nCare: dry clean only. Store on a padded hanger inside a cloth cover.'),
('Classic Winter Shawl','classic-winter-shawl','RZ-S105','winter-shawls',5500,null,15,
 'Wool Blend','36 × 78 in','Woven tie-dye pattern','Fuchsia & Ivory',
 '[{"name":"Fuchsia","hex":"#c2266f"},{"name":"Ivory","hex":"#f1ebe1"}]','Everyday','Winter',true,28,
 'An everyday winter shawl in fuchsia and ivory, soft and easy to layer.',
 E'A cosy, easy-to-wear shawl with a woven tie-dye pattern in fuchsia and ivory. Light enough to layer over a coat, warm enough on its own.\n\nCare: hand wash cold with a mild wool detergent. Dry flat in shade.'),
('Mehr Lawn Suit','mehr-lawn-suit','RZ-C204','casual-wear',4500,null,0,
 'Cotton Lawn','3-piece: shirt, trouser, dupatta','Chikankari-style embroidery','Pale Yellow',
 '[{"name":"Pale Yellow","hex":"#ecdca0"}]','Everyday','Summer',false,6,
 'A pale yellow lawn three-piece with fine chikankari-style embroidery.',
 E'A fresh summer three-piece in soft yellow cotton lawn with delicate chikankari-style embroidery and a printed dupatta.\n\nCare: hand wash cold, dry in shade, iron on medium heat.'),
('Sana Pastel Co-ord','sana-pastel-coord','RZ-C205','casual-wear',4200,4800,0,
 'Cotton Cambric','2-piece: shirt, trouser','Minimal tonal finish','Blush Pink',
 '[{"name":"Blush","hex":"#efc7b8"}]','Everyday','All Season',false,5,
 'An easy blush pink two-piece in soft cotton cambric.',
 E'A relaxed two-piece co-ord in blush cotton cambric with a straight shirt and matching trousers. Simple, comfortable and easy to style.\n\nCare: machine wash cold on a gentle cycle; iron on medium heat.'),
('Laila Chiffon Suit','laila-chiffon-suit','RZ-C206','formal-wear',8900,null,0,
 'Chiffon','3-piece: shirt, trouser, dupatta','White thread embroidery','Powder Blue',
 '[{"name":"Powder Blue","hex":"#a9bfdc"},{"name":"White","hex":"#f6f6f4"}]','Formal','All Season',false,4,
 'A powder blue chiffon suit with white thread embroidery and a matching dupatta.',
 E'Airy powder blue chiffon with intricate white thread embroidery on the shirt and dupatta. A graceful choice for daytime events and dinners.\n\nCare: dry clean recommended. Iron on low heat on the reverse.'),
('Inaya Pret Two-Piece','inaya-pret-two-piece','RZ-C207','womens-clothing',3900,null,0,
 'Cotton Linen','2-piece: shirt, trouser','Self-textured weave','White',
 '[{"name":"White","hex":"#f4f2ee"}]','Everyday','Summer',false,3,
 'A crisp white ready-to-wear two-piece in breathable cotton linen.',
 E'Ready-to-wear and easy: a crisp white cotton-linen shirt with a subtle self texture and matching trousers.\n\nCare: machine wash cold with whites; iron on medium-high heat.'),
('Pearl Pashmina Shawl','pearl-pashmina-shawl','RZ-S106','luxury-shawls',10500,null,6,
 'Pashmina Blend','40 × 80 in','Plain fine weave','Black',
 '[{"name":"Black","hex":"#161616"}]','Formal','Winter',false,2,
 'A plain black pashmina-blend shawl with a soft, fine hand.',
 E'Understated and endlessly useful: a fine pashmina-blend shawl in solid black that drapes beautifully over any outfit.\n\nCare: dry clean only. Store folded with a cedar block, away from moisture.'),
('Gulnaz Festive Suit','gulnaz-festive-suit','RZ-C208','festive-collection',10900,null,0,
 'Silk & Chiffon','3-piece: shirt, trouser, dupatta','Gota and thread work','Pistachio & Magenta',
 '[{"name":"Pistachio","hex":"#b7c98a"},{"name":"Magenta","hex":"#b5257a"}]','Festive','All Season',false,1,
 'A pistachio festive suit with a magenta-edged dupatta and gota detailing.',
 E'Pistachio silk with gota and thread work, paired with a statement dupatta edged in magenta. Made for mehndi, Eid and family celebrations.\n\nCare: dry clean only. Store away from damp to protect the gota.'),
('Saba Embroidered Suit','saba-embroidered-suit','RZ-C209','womens-clothing',6800,null,0,
 'Khaddar','3-piece: shirt, trouser, shawl','Thread embroidery','Mustard',
 '[{"name":"Mustard","hex":"#d19a2a"}]','Everyday','Winter',false,0,
 'A mustard khaddar three-piece with embroidered front and a woven shawl.',
 E'A warm winter three-piece in mustard khaddar with an embroidered front panel, straight trousers and a matching woven shawl.\n\nCare: hand wash cold separately; dry in shade.')
)
insert into public.products
  (name, slug, sku, short_description, description, category_id, price, compare_at_price, stock_quantity,
   material, dimensions, weave_technique, color, colors, room, style, status, is_featured, created_at)
select v.name, v.slug, v.sku, v.short_d, v.long_d, c.id, v.price, v.compare_at, v.stock,
       v.material, v.dimensions, v.craft, v.color, v.colors::jsonb, v.occasion, v.season, 'published', v.featured,
       now() - make_interval(days => v.age_days)
from v join c on c.slug = v.cat
on conflict (slug) do nothing;

-- archive, never delete: order_items still reference these
update public.products set status = 'archived', is_featured = false
 where slug in ('turquoise-heritage-rug','skyline-wool-rug','sand-textured-rug','classic-pattern-rug',
                'artisan-blue-rug','custom-handwoven-rug','ocean-weave-rug','natural-wool-rug')
   and status <> 'archived';

-- ---------- product images (only for products that have none yet) ----------
insert into public.product_images (product_id, url, alt, sort_order)
select p.id, '/assets/fashion/' || v.file, v.alt, v.ord
from public.products p
join (values
  ('cotton-khaddi-kv-375','cotton-khaddi-kv-375-1.jpg','Cotton Khaddi KV-375: folded brown Kamalia khaddar fabric with buttons',0),
  ('royal-kashmiri-shawl','royal-kashmiri-shawl-1.jpg','Royal Kashmiri Shawl in navy wool with embroidered paisley border',0),
  ('royal-kashmiri-shawl','royal-kashmiri-shawl-2.jpg','Royal Kashmiri Shawl worn draped over the head and shoulders',1),
  ('royal-kashmiri-shawl','royal-kashmiri-shawl-3.jpg','Close-up of Kashmiri paisley pattern',2),
  ('noor-embroidered-shawl','noor-embroidered-shawl-1.jpg','Noor Embroidered Shawl in black with white thread embroidery, styled with a grey suit',0),
  ('noor-embroidered-shawl','noor-embroidered-shawl-2.jpg','Back view of the Noor Embroidered Shawl draped over the shoulder',1),
  ('noor-embroidered-shawl','noor-embroidered-shawl-3.jpg','Detail of colourful Kashmiri thread embroidery',2),
  ('velvet-winter-wrap','velvet-winter-wrap-1.jpg','Velvet Winter Wrap in bottle green with rust paisley',0),
  ('velvet-winter-wrap','velvet-winter-wrap-2.jpg','Velvet Winter Wrap worn as a head wrap outdoors',1),
  ('velvet-winter-wrap','velvet-winter-wrap-3.jpg','Velvet Winter Wrap styled on a city street',2),
  ('zareen-luxury-shawl','zareen-luxury-shawl-1.jpg','Zareen Luxury Shawl in royal blue with hand embroidery',0),
  ('zareen-luxury-shawl','zareen-luxury-shawl-2.jpg','Zareen Luxury Shawl draped over the shoulders',1),
  ('zareen-luxury-shawl','zareen-luxury-shawl-3.jpg','Close-up of warm paisley shawl pattern',2),
  ('ayesha-embroidered-suit','ayesha-embroidered-suit-1.jpg','Ayesha Embroidered Suit in black chiffon with ivory embroidery and dupatta',0),
  ('mahnoor-three-piece-suit','mahnoor-three-piece-suit-1.jpg','Mahnoor Three-Piece Suit in crimson lawn',0),
  ('mahnoor-three-piece-suit','mahnoor-three-piece-suit-2.jpg','Detail of hand embroidered flower on fabric',1),
  ('zara-festive-collection','zara-festive-collection-1.jpg','Zara Festive Collection lilac suit with embroidered dupatta',0),
  ('zara-festive-collection','zara-festive-collection-2.jpg','Detail of mirror work embroidery',1),
  ('classic-winter-shawl','classic-winter-shawl-1.jpg','Classic Winter Shawl in fuchsia and ivory worn in snow',0),
  ('classic-winter-shawl','classic-winter-shawl-2.jpg','Close-up of soft woven wool texture',1),
  ('mehr-lawn-suit','mehr-lawn-suit-1.jpg','Mehr Lawn Suit in pale yellow with embroidery',0),
  ('sana-pastel-coord','sana-pastel-coord-1.jpg','Sana Pastel Co-ord two-piece in blush pink',0),
  ('laila-chiffon-suit','laila-chiffon-suit-1.jpg','Laila Chiffon Suit in powder blue with white embroidery',0),
  ('laila-chiffon-suit','laila-chiffon-suit-2.jpg','Detail of white thread embroidery on grey fabric',1),
  ('inaya-pret-two-piece','inaya-pret-two-piece-1.jpg','Inaya Pret Two-Piece in white cotton linen',0),
  ('pearl-pashmina-shawl','pearl-pashmina-shawl-1.jpg','Pearl Pashmina Shawl in solid black',0),
  ('gulnaz-festive-suit','gulnaz-festive-suit-1.jpg','Gulnaz Festive Suit in pistachio with magenta dupatta',0),
  ('saba-embroidered-suit','saba-embroidered-suit-1.jpg','Saba Embroidered Suit in mustard khaddar',0)
) as v(slug, file, alt, ord) on v.slug = p.slug
where not exists (select 1 from public.product_images i where i.product_id = p.id);

-- ---------- sizes for clothing; shawls sell as one size ----------
insert into public.product_variants (product_id, label, price_delta, stock_quantity, sort_order)
select p.id, s.label, 0, s.qty, s.ord
from public.products p
cross join (values ('XS',2,1),('S',4,2),('M',4,3),('L',3,4),('XL',2,5)) as s(label, qty, ord)
where p.slug in ('ayesha-embroidered-suit','mahnoor-three-piece-suit','zara-festive-collection','mehr-lawn-suit',
                 'sana-pastel-coord','laila-chiffon-suit','inaya-pret-two-piece','gulnaz-festive-suit','saba-embroidered-suit')
on conflict (product_id, label) do nothing;

update public.products p
   set stock_quantity = (select sum(v.stock_quantity) from public.product_variants v where v.product_id = p.id)
 where p.stock_quantity = 0
   and exists (select 1 from public.product_variants v where v.product_id = p.id);

-- ---------- banners ----------
with b(title, subtitle, eyebrow, placement, image_url, link_url, cta_label, sort_order) as (values
('Elegance Woven Into Every Thread.',
 'Discover timeless Pakistani fashion, beautifully crafted shawls, and elegant outfits designed to make every moment special.',
 'Khaddar, Shawls & Pakistani Fashion','home_hero','/assets/fashion/hero.webp','/shop','Explore Collection',1),
('Shawls for Every Season',
 'From soft everyday wraps to hand-embroidered heirloom pieces, find the shawl that completes your look.',
 'EXPLORE BY OCCASION','home_lifestyle','/assets/fashion/lifestyle.jpg','/shop','Shop by Occasion',2),
('A Story of Heritage, Craft & Grace',
 'Every Khaddar Virsa piece celebrates Pakistani textile traditions and the skilled hands that bring embroidery and weaving to life.',
 'OUR CRAFTSMANSHIP','home_story','/assets/fashion/story.jpg','/our-story','Discover Our Story',3),
('Beautiful Shawls, Timeless Style',
 'Find your perfect piece.','','shop_lifestyle','/assets/fashion/cat-embroidered-shawls.jpg','/collections','Explore Collections',4)
),
upd as (
  update public.banners t
     set title = b.title, subtitle = b.subtitle, eyebrow = b.eyebrow, image_url = b.image_url,
         link_url = b.link_url, cta_label = b.cta_label
    from b
   where t.placement = b.placement
     and (t.image_url like '/assets/rug%' or t.image_url like '/assets/blue_rug%' or t.title ~* '\mrugs?\M'
          or t.subtitle ~* '\mrugs?\M' or t.eyebrow ~* '\mrugs?\M')
  returning t.placement
)
insert into public.banners (title, subtitle, eyebrow, placement, image_url, link_url, cta_label, sort_order)
select b.title, b.subtitle, b.eyebrow, b.placement, b.image_url, b.link_url, b.cta_label, b.sort_order
from b
where not exists (select 1 from public.banners t where t.placement = b.placement);

-- ---------- CMS pages (slug 'rug-care' kept as the internal key for Fabric Care) ----------
with pg(title, slug, hero_heading, meta_title, meta_description, hero_image_url, content, status, is_system) as (values
('Our Story','our-story','A Story Woven by Hand','Our Story — Khaddar Virsa Khaddar, Shawls & Pakistani Fashion',
 'Khaddar Virsa revives Pakistan''s rich textile heritage with premium, chemical-free khaddar for the modern wardrobe.',
 '/assets/fashion/story.jpg',
 E'<h2>Our Story</h2>\n<p>Khaddar Virsa was born out of a passion to revive Pakistan''s rich textile heritage for the modern world. We set out to redefine traditional wear by creating premium, lightweight khaddar that bridges the gap between cultural roots and contemporary everyday fashion.</p>\n<h2>Our Mission</h2>\n<p>To deliver high-quality, 100% chemical-free fabrics that provide breathable comfort and safety for every body type, and to make premium, skin-friendly fashion accessible across Pakistan through a seamless and reliable online shopping experience.</p>\n<h2>Our Vision</h2>\n<p>To become Pakistan''s leading destination for sustainable, heritage-inspired apparel, consistently blending modern wardrobe sophistication with pure, eco-friendly fabrics.</p>',
 'published'::public.page_status, true),
('Fabric Care','rug-care','Fabric Care','Shawl & Fabric Care — Khaddar Virsa',
 'Simple care for shawls, embroidery and everyday fabrics, so your pieces stay beautiful for longer.',
 '/assets/fashion/cat-winter-shawls.jpg',
 E'<p>Thoughtful habits help preserve fine fibres and delicate embroidery. The guidance below suits most of our shawls and outfits; always check the care note on each product.</p>',
 'published', true),
('Contact','contact','Contact Us','Contact — Khaddar Virsa Khaddar, Shawls & Pakistani Fashion',
 'Questions about sizing, fabrics or an order? Our team would love to hear from you.',
 '/assets/fashion/cat-womens-clothing.jpg','', 'published', true),
('Shipping & Returns','shipping-and-returns','Delivery & Returns','Delivery & Returns — Khaddar Virsa',
 'Delivery across Pakistan in 3–5 working days, Cash on Delivery, and 15-day returns and exchanges.','/assets/fashion/cat-casual-wear.jpg',
 E'<p>At Khaddar Virsa we strive to provide a seamless shopping experience, with reliable delivery and a fair return policy.</p>\n<h2>Order processing</h2>\n<p>All orders are processed within 1–2 working days after confirmation. Orders placed on weekends or public holidays are processed on the next working day.</p>\n<h2>Delivery time</h2>\n<p>Delivery across Pakistan typically takes 3–5 working days. Remote areas may take slightly longer depending on the location and courier routing.</p>\n<h2>Shipping charges</h2>\n<p>Any applicable charges are clearly displayed at checkout before you place your order.</p>\n<h2>Cash on Delivery</h2>\n<p>We offer Cash on Delivery all across Pakistan.</p>\n<h2>Delays</h2>\n<p>Delays may occasionally occur due to unforeseen circumstances such as extreme weather, political situations or courier operational issues.</p>\n<h2>Our return commitment</h2>\n<p>Our return policy follows the Sunnah. We accept returns for any suit or fabric that you are unsatisfied with.</p>\n<h2>Eligibility for returns and exchanges</h2>\n<p>We accept returns or exchanges if you are not satisfied with the fabric quality, feel or colour; if the product is damaged, torn or has a manufacturing defect; or if you received the wrong item, design or size.</p>\n<p>Requests must be made within 15 days of purchase. The fabric or suit must be unwashed, unused and unstitched, with all original tags and packaging intact. Items damaged by mishandling or incorrect washing are not eligible.</p>\n<h2>Processing time</h2>\n<p>Please allow 5–6 working days to process your return or exchange once the item reaches our warehouse and is inspected.</p>\n<h2>Refunds</h2>\n<p>Approved refunds are issued by bank transfer, EasyPaisa/JazzCash or store credit. Original delivery charges are non-refundable.</p>\n<h2>Exchanges</h2>\n<p>You may exchange an item for the same product or design, subject to availability. If it is out of stock, you can choose another item of equal value or receive store credit.</p>\n<h2>Order cancellation</h2>\n<p>Orders can only be cancelled before dispatch. Once the shipment is handed to the courier, it cannot be cancelled.</p>\n<h2>Contact us</h2>\n<p>Email: info@khaddervirsa.com · Phone/WhatsApp: +92 342 4307737</p>',
 'published', false),
('Size Guide','size-guide','Finding Your Size','Size Guide — Khaddar Virsa',
 'How to choose the right size for our suits and pret.','/assets/fashion/cat-formal-wear.jpg',
 E'<h2>How to measure</h2>\n<p>Measure around the fullest part of your chest with a soft tape, keeping it level and comfortable.</p>\n<h2>Chest measurements</h2>\n<p>XS: 34 in · S: 36 in · M: 38 in · L: 40 in · XL: 42 in</p>\n<h2>Between sizes?</h2>\n<p>Choose the larger size for a relaxed fit. Fits can vary slightly by design, so check the product description or contact us for exact garment measurements.</p>\n<h2>Shawls</h2>\n<p>Shawls are one size. Dimensions are listed on each product page.</p>',
 'published', false),
('FAQs','faqs','Frequently Asked Questions','FAQs — Khaddar Virsa Khaddar, Shawls & Pakistani Fashion',
 'Answers to common questions about our shawls, suits and orders.','/assets/fashion/cat-festive-collection.jpg',
 E'<h2>How do I choose my size?</h2>\n<p>See our Size Guide for chest measurements. Shawls are one size, with dimensions listed on each product.</p>\n<h2>How should I care for an embroidered shawl?</h2>\n<p>Most embroidered and pashmina-blend pieces should be dry cleaned. Each product lists its own care instructions.</p>\n<h2>Do colours look exactly like the photos?</h2>\n<p>We photograph every piece carefully, but screens vary and handwork means small differences between pieces.</p>',
 'published', false)
)
insert into public.pages as t (title, slug, hero_heading, meta_title, meta_description, hero_image_url, content, status, is_system)
select title, slug, hero_heading, meta_title, meta_description, hero_image_url, content, status, is_system from pg
on conflict (slug) do update
   set title = excluded.title, hero_heading = excluded.hero_heading, meta_title = excluded.meta_title,
       meta_description = excluded.meta_description, hero_image_url = excluded.hero_image_url, content = excluded.content
 where t.hero_image_url like '/assets/%rug%' or t.title ~* '\mrugs?\M' or t.content ~* '\mrugs?\M'
    or t.meta_title ~* '\mrugs?\M' or t.meta_description ~* '\mrugs?\M';

-- ---------- Fabric Care content (settings key stays 'rug_care') ----------
insert into public.settings as t (key, value) values
('rug_care', jsonb_build_object(
  'tips', jsonb_build_array(
    jsonb_build_object('title','Gentle Cleaning','body','Dry clean embroidered and pashmina pieces; hand wash lawn and cotton in cold water.','image','/assets/fashion/classic-winter-shawl-2.jpg'),
    jsonb_build_object('title','Handle Spills Quickly','body','Blot with a clean, dry cloth. Never rub embroidery or use harsh stain removers.','image','/assets/fashion/laila-chiffon-suit-2.jpg'),
    jsonb_build_object('title','Air Between Wears','body','Hang shawls in fresh air for a few hours instead of washing after every wear.','image','/assets/fashion/cat-luxury-shawls.jpg'),
    jsonb_build_object('title','Thoughtful Storage','body','Fold shawls loosely in breathable cotton or muslin; avoid plastic covers.','image','/assets/fashion/cat-winter-shawls.jpg'),
    jsonb_build_object('title','Protect Natural Fibres','body','Keep wool and pashmina away from damp, moths and long exposure to strong sunlight.','image','/assets/fashion/pearl-pashmina-shawl-1.jpg'),
    jsonb_build_object('title','Careful Pressing','body','Iron on the reverse at low heat and never press directly on zari, gota or mirror work.','image','/assets/fashion/zara-festive-collection-2.jpg')),
  'faqs', jsonb_build_array(
    jsonb_build_object('q','Can I wash my shawl at home?','a','Plain wool blends can be hand washed cold with a mild wool detergent. Embroidered, pashmina and luxury shawls should be dry cleaned.'),
    jsonb_build_object('q','What should I do after a spill?','a','Blot straight away with a clean, dry cloth, working from the outside in. Do not rub, and take delicate pieces to a dry cleaner.'),
    jsonb_build_object('q','How do I stop colours from running?','a','Wash brightly dyed lawn and cotton separately in cold water for the first few washes and dry in shade.'),
    jsonb_build_object('q','How should I iron embroidered outfits?','a','Turn the garment inside out and use low heat with a pressing cloth. Avoid pressing directly over zari, gota or mirror work.'),
    jsonb_build_object('q','How do I store a pashmina?','a','Fold it loosely in a cotton or muslin bag with a cedar block, away from damp. Avoid hanging, which can stretch the fibres.'),
    jsonb_build_object('q','How do I keep moths away?','a','Store pieces clean, use cedar or lavender sachets, and air your shawls every few weeks during the off-season.'))))
on conflict (key) do update set value = excluded.value
 where t.value::text ~* '\mrugs?\M' or t.value::text like '%/assets/rug%' or t.value::text like '%blue_rug%';

-- ---------- store copy (never the currency) ----------
update public.settings set value = value || jsonb_build_object('tagline','FEEL THE FABRIC OF TRADITION')
 where key = 'store' and value->>'tagline' = 'HANDMADE RUGS';
update public.settings set value = value || jsonb_build_object('name','Khaddar Virsa')
 where key = 'store' and value->>'name' = 'Rugistan';
update public.settings set value = value || jsonb_build_object('email','info@khaddervirsa.com')
 where key = 'store' and coalesce(value->>'email','') = '';
update public.settings set value = value || jsonb_build_object('phone','+92 342 4307737')
 where key = 'store' and coalesce(value->>'phone','') = '';
update public.settings set value = value || jsonb_build_object('whatsapp','+92 342 4307737')
 where key = 'store' and coalesce(value->>'whatsapp','') = '';
update public.settings set value = value || jsonb_build_object('location','5 Jahangir Road, Ganj Mughalpura, Lahore, Punjab, Pakistan')
 where key = 'store' and coalesce(value->>'location','') = '';
update public.settings set value = value || jsonb_build_object('announcement',
       jsonb_build_array('Free Delivery in Pakistan','100% Chemical-Free Fabrics  |  Guaranteed Premium Quality','Customer Care'))
 where key = 'store' and (value->'announcement')::text ~* '\mrugs?\M';
-- the PKR conversion left rug-era price bands; fashion prices need lower ones
update public.settings set value = value || jsonb_build_object('price_filter_limits', jsonb_build_array(7000,10000))
 where key = 'store' and value->'price_filter_limits' = '[83046, 138410]'::jsonb;
update public.settings set value = replace(value::text, 'when your rug is delivered', 'when your order is delivered')::jsonb
 where key = 'payments' and value::text like '%when your rug is delivered%';

-- ---------- privacy policy from khaddervirsa.com (replaces only the unwritten placeholder) ----------
insert into public.pages as t (title, slug, hero_heading, meta_title, meta_description, hero_image_url, content, status, is_system)
values ('Privacy Policy','privacy-policy','Privacy Policy','Privacy Policy — Khaddar Virsa',
 'How Khaddar Virsa collects, uses and protects your personal information.', null,
 E'<p>At Khaddar Virsa, accessible from khaddervirsa.com, your privacy is one of our main priorities. This policy outlines the information we collect and how we use it.</p>\n<h2>Information we collect</h2>\n<p>We may collect your name, email address, phone number, shipping and billing address, and order details when you place an order, contact us by email or WhatsApp, or subscribe to our updates.</p>\n<h2>How we use your information</h2>\n<p>To process and deliver your orders, to communicate with you about your order or enquiries, to improve our website and services, and to send updates, promotions or offers if you opt in.</p>\n<h2>Data protection</h2>\n<p>We take appropriate security measures to protect your personal information. Your data is never sold, traded or shared with third parties except when necessary to fulfil your order, for example with courier and shipping services.</p>\n<h2>Cookies</h2>\n<p>Our website may use cookies to enhance your experience. You can disable cookies in your browser settings.</p>\n<h2>Third-party services</h2>\n<p>We may use trusted third-party services for payment processing and delivery. These services have their own privacy policies.</p>\n<h2>Your consent</h2>\n<p>By using our website, you consent to this Privacy Policy and agree to its terms.</p>\n<h2>Contact us</h2>\n<p>Email: info@khaddervirsa.com · Phone: +92 342 4307737</p>',
 'published', false)
on conflict (slug) do update
   set meta_title = excluded.meta_title, meta_description = excluded.meta_description,
       content = excluded.content, status = excluded.status
 where t.content like '%This policy is being prepared%';

-- ---------- customer-facing error text inside checkout functions ----------
do $fix$
declare f record; def text;
begin
  for f in select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.prosrc ~ '(rug in your cart|of each rug|size for this rug)'
  loop
    def := pg_get_functiondef(f.oid);
    def := replace(def, 'A rug in your cart is no longer available.', 'An item in your cart is no longer available.');
    def := replace(def, 'Choose between 1 and 10 of each rug.', 'Choose between 1 and 10 of each item.');
    def := replace(def, 'Please choose a size for this rug.', 'Please choose a size for this item.');
    execute def;  -- create or replace keeps existing grants
  end loop;
end $fix$;
