-- Home page: point the three home banners at the new campaign photos (old uploads stay in storage; admin can change them again any time).
update public.banners set image_url = '/assets/fashion/home-hero-duo.webp', updated_at = now() where placement = 'home_hero';
update public.banners set image_url = '/assets/fashion/home-story-waistcoat.webp', updated_at = now() where placement = 'home_story';
update public.banners set image_url = '/assets/fashion/home-lifestyle-seated.webp', updated_at = now() where placement = 'home_lifestyle';
