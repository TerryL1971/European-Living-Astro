-- Base locations for the /day-trips "≈ drive from your base" estimate.
-- Six fixed points (US military communities in Germany). Kept in sync
-- with the fallback in src/data/bases.ts.

create table if not exists public.bases (
  id   text primary key,
  name text not null,
  lat  double precision not null,
  lng  double precision not null,
  updated_at timestamptz not null default now()
);

alter table public.bases enable row level security;

drop policy if exists "bases are public read" on public.bases;
create policy "bases are public read" on public.bases
  for select using (true);

insert into public.bases (id, name, lat, lng) values
  ('ramstein',       'Ramstein AB',     49.4369,  7.6003),
  ('stuttgart',      'USAG Stuttgart',  48.7447,  9.0949),
  ('kaiserslautern', 'KMC Area',        49.4275,  7.7480),
  ('wiesbaden',      'USAG Wiesbaden',  50.0498,  8.3253),
  ('grafenwoehr',    'USAG Bavaria',    49.6994, 11.9403),
  ('spangdahlem',    'Spangdahlem AB',  49.9727,  6.6925)
on conflict (id) do update
  set name = excluded.name, lat = excluded.lat, lng = excluded.lng, updated_at = now();
