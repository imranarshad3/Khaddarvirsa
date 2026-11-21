-- Khaddar Virsa now sells men's khaddar only: hide the women's suits and shawls (archived, not deleted,
-- so past orders keep their product rows) and point the storefront banners at men's fabric imagery.
update products p set status = 'archived', updated_at = now()
from categories c
where c.id = p.category_id and p.status <> 'archived'
  and c.slug in ('womens-clothing','casual-wear','formal-wear','festive-collection','premium-shawls','winter-shawls','embroidered-shawls','luxury-shawls');

update categories set is_active = false
where slug in ('womens-clothing','casual-wear','formal-wear','festive-collection','premium-shawls','winter-shawls','embroidered-shawls','luxury-shawls');

update banners set subtitle = 'Discover handwoven Pakistani khaddar for men, from everyday Kamalia cloth to hand-loomed designer khaddi.'
where placement = 'home_hero' and subtitle like '%shawls%';

update banners set title = 'Khaddar for Every Season',
  subtitle = 'From soft pure khaddi to warm winter weaves, find the suit fabric that suits your style.', cta_label = 'Shop Khaddar'
where placement = 'home_lifestyle' and title = 'Shawls for Every Season';

update banners set subtitle = 'Every Khaddar Virsa suit celebrates Pakistani weaving traditions and the skilled hands that bring khaddar to life.'
where placement = 'home_story' and subtitle like '%embroidery%';

update banners set title = 'Handwoven Khaddar, Timeless Style', image_url = '/assets/fashion/shop-lifestyle.jpg'
where placement = 'shop_lifestyle' and title = 'Beautiful Shawls, Timeless Style';

-- Keep the home page's featured row full now that the featured shawls and suits are archived.
update products set is_featured = true, updated_at = now()
where slug in ('khaddar-suit-for-men-unstitched-blues-teals-7-colours-kv-200','khaddar-suit-for-men-unstitched-browns-rust-reds-7-colours-kv-100','handmade-khaddar-suit-for-men-black-gold-designer-hk-27');
