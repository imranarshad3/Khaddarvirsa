-- The home hero now shows the admin banner image; point the stale upload at the current campaign photo.
update public.banners
set image_url = '/assets/fashion/hero.webp', updated_at = now()
where placement = 'home_hero'
  and image_url = 'https://hvarlsrzathiffqyuzfk.supabase.co/storage/v1/object/public/media/banners/3f8fbe1d-8a6b-4068-bad1-9b744694c787.png';
