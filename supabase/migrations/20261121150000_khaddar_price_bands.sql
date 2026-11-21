-- Shop price filter: the 7,000 / 10,000 split was set for the old catalogue and now puts 48 of 54 suits in one band.
-- 3,500 / 5,000 splits the khaddar range (Rs 1,699–14,000) into 11 / 24 / 19. Only changes the untouched old value.
update public.settings set value = value || jsonb_build_object('price_filter_limits', jsonb_build_array(3500, 5000))
where key = 'store' and value->'price_filter_limits' = '[7000, 10000]'::jsonb;
