-- Supabase is ending automatic Data API grants on new `public` tables as
-- of 2026-10-30 (see their email, subject "Action needed: Data API access
-- changes for new tables"). Existing tables keep their current grants —
-- confirmed live against this project on 2026-10-20, every one of these
-- 13 tables already has full anon/authenticated/service_role grants.
--
-- This migration does two things:
--   1. Makes those grants explicit in version control instead of relying
--      on invisible, soon-to-be-retired project-level defaults. Running
--      it changes nothing live (every grant below already exists).
--   2. Matters for the day this schema is ever replayed from scratch
--      (a new Supabase project, a preview branch, local `supabase db
--      reset`) — after 2026-10-30, a freshly CREATEd table gets no API
--      access unless grants are issued in the same migration. `bases`
--      is the only one of these 13 tables this repo actually has a
--      CREATE TABLE migration for; see 20260829091543_bases_table.sql,
--      which both this file's grants AND the original migration will
--      now cover redundantly (harmless — GRANT is idempotent).
--
-- The other 12 tables here were created directly in the Supabase SQL
-- editor / dashboard and have no CREATE TABLE migration in this repo at
-- all — replaying only this repo's migrations will NOT recreate them.
-- That's a pre-existing gap unrelated to this email; this migration
-- only guarantees that IF they exist, their API grants are explicit.
--
-- Mirrors exactly what's already live: full CRUD to anon, authenticated,
-- and service_role on every table (RLS policies are the actual access
-- control layer on top of these grants — this migration doesn't change
-- any RLS policy). New tables going forward should get the same three
-- GRANT statements added in the same migration that creates them.

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'articles',
      'bases',
      'business_consent_log',
      'businesses',
      'day_trip_tags',
      'day_trips',
      'destination_submissions',
      'featured_content',
      'phrase_categories',
      'phrases',
      'reviews',
      'tags',
      'user_saved_trips'
    ])
  loop
    execute format('grant select, insert, update, delete on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end $$;
