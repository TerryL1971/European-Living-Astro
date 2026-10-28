-- Redeploys the (fully static) site whenever the businesses table
-- changes, so edits like a business's map coordinates, photo, or
-- consent/visibility status show up on the live site without someone
-- having to remember to push an empty commit. See
-- src/pages/businesses/[slug].astro and getStaticPaths() — this table
-- is read entirely at build time.
--
-- FOR EACH STATEMENT (not FOR EACH ROW): a single bulk SQL update
-- (e.g. backfilling coordinates across many rows at once, as done
-- manually once already) should trigger one rebuild, not one per row.
--
-- The URL is a Vercel Deploy Hook (Project Settings -> Git -> Deploy
-- Hooks, "main" branch) — write-only (it can only queue a rebuild,
-- can't read or change anything), but it's still a bearer secret:
-- anyone holding it can trigger rebuilds against your Vercel usage.
-- Stored in Supabase Vault (already enabled on this project) instead
-- of inline here, so it never lands in git history. One-time setup,
-- run directly against the project (not committed):
--   select vault.create_secret(
--     '<the deploy hook URL from Vercel>',
--     'vercel_deploy_hook_url',
--     'Vercel deploy hook, triggered on businesses table changes'
--   );
create or replace function public.trigger_vercel_redeploy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  hook_url text;
begin
  select decrypted_secret into hook_url
  from vault.decrypted_secrets
  where name = 'vercel_deploy_hook_url';

  if hook_url is null then
    -- Secret not set up yet on this project — no-op rather than error,
    -- so a missing webhook config never blocks the real write.
    return null;
  end if;

  -- Default pg_net timeout (5s) wasn't always enough for Supabase's
  -- egress to reach Vercel's API in testing — bumped to 15s. This is
  -- fire-and-forget either way (RETURN NULL below, no error surfaced
  -- to the actual INSERT/UPDATE/DELETE), so a slow or failed call here
  -- never blocks or fails the real database write.
  perform net.http_post(
    url := hook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 15000
  );
  return null;
end;
$$;

drop trigger if exists businesses_deploy_on_change on public.businesses;
create trigger businesses_deploy_on_change
after insert or update or delete on public.businesses
for each statement
execute function public.trigger_vercel_redeploy();
