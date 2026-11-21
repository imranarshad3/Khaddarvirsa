-- Men's khaddar copy: replace remaining shawl / embroidery wording in CMS pages and the home hero banner.
-- Only rewrites text; no rows are deleted.

update banners set eyebrow = 'Men''s Khaddar Suits'
where placement = 'home_hero' and eyebrow ilike '%shawl%';

update pages set
  meta_title = 'Fabric Care — Khaddar Virsa',
  meta_description = 'Simple care for cotton khaddar, so your suits keep their colour and texture for longer.',
  content = '<p>Good habits keep cotton khaddar soft, rich in colour and true to its handloom texture. The guidance below suits our khaddar suit fabrics; always check the care note on each product.</p>'
where slug = 'rug-care';

update pages set
  meta_description = 'Fabric lengths for our unstitched khaddar suits, and how to plan with your tailor.',
  content = '<h2>Unstitched suit fabric</h2>
<p>Our khaddar suits are sold unstitched, so there is no S, M or L to choose. Each full suit is 7 metres of fabric, enough for a shalwar kameez, and comes with matching buttons.</p>
<h2>Fabric width</h2>
<p>The width is listed on each product page where we have it (for example, 35 inches on some lines).</p>
<h2>Getting the right fit</h2>
<p>Take the fabric to your tailor with your usual measurements. If you are unsure whether one suit length is enough for your size or style, contact us before ordering and we will help.</p>'
where slug = 'size-guide';

update pages set
  meta_title = 'FAQs — Khaddar Virsa Men''s Khaddar Suits',
  meta_description = 'Answers to common questions about our khaddar suits and orders.',
  content = '<h2>Do I need to choose a size?</h2>
<p>No. Our suits are unstitched: each full suit is 7 metres of fabric with matching buttons, ready for your tailor. See our Size Guide for details.</p>
<h2>How should I care for khaddar?</h2>
<p>Our khaddar is 100% cotton. Wash in cold water with a mild detergent and dry in the shade. Each product lists its own care instructions.</p>
<h2>Do colours look exactly like the photos?</h2>
<p>We photograph every piece carefully, but screens vary and handloom weaving means small differences between pieces.</p>'
where slug = 'faqs';

-- Page titles that still carry the old shawls tagline.
update pages set meta_title = replace(meta_title, 'Khaddar Virsa Khaddar, Shawls & Pakistani Fashion', 'Khaddar Virsa Men''s Khaddar Suits')
where meta_title like '%Khaddar, Shawls & Pakistani Fashion%';
