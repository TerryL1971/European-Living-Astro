-- Baumholder (USAG Rheinland-Pfalz, Smith Barracks) — 4 day trips now
-- list it in bases_served but it was missing from the bases table.

insert into public.bases (id, name, lat, lng) values
  ('baumholder', 'USAG Baumholder', 49.6150, 7.2980)
on conflict (id) do update
  set name = excluded.name, lat = excluded.lat, lng = excluded.lng, updated_at = now();
