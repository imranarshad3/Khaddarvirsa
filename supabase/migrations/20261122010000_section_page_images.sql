-- Section photos: CMS page heroes still pointed at the archived women's/shawl category images.
-- Only swaps image paths; guarded so pages an admin has since changed are left alone.
update pages set hero_image_url = '/assets/fashion/suiting-stack.webp'
where slug = 'shipping-and-returns' and hero_image_url = '/assets/fashion/cat-casual-wear.jpg';
update pages set hero_image_url = '/assets/fashion/tailor-chalk.webp'
where slug = 'size-guide' and hero_image_url = '/assets/fashion/cat-formal-wear.jpg';
update pages set hero_image_url = '/assets/fashion/fabric-vendor.webp'
where slug = 'contact' and hero_image_url = '/assets/fashion/cat-womens-clothing.jpg';
update pages set hero_image_url = '/assets/fashion/care-hero.webp'
where slug = 'rug-care' and hero_image_url = '/assets/fashion/cat-winter-shawls.jpg';
update pages set hero_image_url = '/assets/fashion/tailor-workshop.webp'
where slug = 'faqs' and hero_image_url = '/assets/fashion/cat-festive-collection.jpg';
