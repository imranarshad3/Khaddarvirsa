-- ============================================================
-- Starter settings for the Khaddar Virsa store.
-- The fashion catalogue, banners, pages and care content come from
-- migration 20261121000000_fashion_catalogue.sql, which runs before this file.
-- No orders, customers, reviews or revenue are fabricated.
-- ============================================================

-- ---------- store settings ----------
insert into public.settings (key, value) values
('store', jsonb_build_object(
   'name','Khaddar Virsa',
   'tagline','FEEL THE FABRIC OF TRADITION',
   'email','info@khaddervirsa.com',
   'phone','+92 342 4307737',
   'whatsapp','+92 342 4307737',
   'location','5 Jahangir Road, Ganj Mughalpura, Lahore, Punjab, Pakistan',
   'currency','PKR',
   'currency_symbol','Rs ',
   'price_filter_limits', jsonb_build_array(7000,10000),
   'timezone','Asia/Karachi',
   'logo_url','',
   'favicon_url','',
   'announcement', jsonb_build_array('Free Delivery in Pakistan','100% Chemical-Free Fabrics  |  Guaranteed Premium Quality','Customer Care'),
   'social', jsonb_build_object('instagram','','pinterest','','facebook',''))),
('payments', jsonb_build_object(
   'offline_methods', jsonb_build_array(
     jsonb_build_object('id','cod','label','Cash on Delivery','enabled',true,
       'marks_as','unpaid',
       'instructions','Pay the courier in cash when your order is delivered.'),
     jsonb_build_object('id','bank_transfer','label','Bank Transfer','enabled',false,
       'marks_as','awaiting_confirmation',
       'instructions','Bank account details will be emailed with your order confirmation.')),
   'gateways', jsonb_build_array())),
('contact_page', jsonb_build_object(
   'email_note','Contact information to be configured',
   'phone_note','Business number to be configured',
   'location_note','Showroom information to be confirmed'))
on conflict (key) do nothing;

-- ---------- delivery ----------
insert into public.shipping_methods (name, description, amount, is_active, sort_order) values
('Standard Delivery','Delivered within 5–8 working days.', 0,  true, 1),
('Express Delivery','Delivered within 2–3 working days where available.', 9689, true, 2)
on conflict do nothing;

-- ---------- CMS pages ----------
insert into public.pages (title, slug, hero_heading, meta_title, meta_description, hero_image_url, content, status, is_system) values
('Privacy Policy','privacy-policy','Privacy Policy','Privacy Policy — Khaddar Virsa',
 'How Khaddar Virsa collects, uses and protects your personal information.', null,
 E'<p>At Khaddar Virsa, accessible from khaddervirsa.com, your privacy is one of our main priorities. This policy outlines the information we collect and how we use it.</p>\n<h2>Information we collect</h2>\n<p>We may collect your name, email address, phone number, shipping and billing address, and order details when you place an order, contact us by email or WhatsApp, or subscribe to our updates.</p>\n<h2>How we use your information</h2>\n<p>To process and deliver your orders, to communicate with you about your order or enquiries, to improve our website and services, and to send updates, promotions or offers if you opt in.</p>\n<h2>Data protection</h2>\n<p>We take appropriate security measures to protect your personal information. Your data is never sold, traded or shared with third parties except when necessary to fulfil your order, for example with courier and shipping services.</p>\n<h2>Cookies</h2>\n<p>Our website may use cookies to enhance your experience. You can disable cookies in your browser settings.</p>\n<h2>Third-party services</h2>\n<p>We may use trusted third-party services for payment processing and delivery. These services have their own privacy policies.</p>\n<h2>Your consent</h2>\n<p>By using our website, you consent to this Privacy Policy and agree to its terms.</p>\n<h2>Contact us</h2>\n<p>Email: info@khaddervirsa.com · Phone: +92 342 4307737</p>',
 'published', false)
on conflict (slug) do nothing;
