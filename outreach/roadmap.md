# English Services Outreach — Roadmap

Ongoing outreach to English-speaking businesses near U.S. bases in Germany,
inviting them to a free listing on European Living's Services Directory.
Started 2026-08-21. Paced deliberately (3-5 emails/run, weekdays only) to
avoid spam flags on a brand-new sending account, while still working
toward full coverage: every real English-speaking business findable for
each base, in each of the 9 categories — not just one token lead per
gap. Updated 2026-08-25: cadence raised from 1-2/day to 3-5/day, and
scoped to Mon-Fri only (the routine's cron no longer fires on
weekends).

**Owner mailbox:** european.living.live@gmail.com (Gmail MCP connector)
**Target form:** https://www.european-living.live/submit-business (handles
its own consent-confirmation step — nothing goes live without the business
confirming, so this outreach only needs to get them to click through)

## The 9 service categories

automotive, healthcare, restaurants, shopping, home-services, real-estate,
legal-business, education, hbb (business services)

## Base area priority order

1. **Stuttgart** (USAG Stuttgart — Patch, Panzer, Kelley, Robinson) — in progress
2. **Kaiserslautern Military Community** (Ramstein, Vogelweh, Landstuhl) — largest U.S. population in Germany, do next
3. **Wiesbaden** (USAG Wiesbaden / Clay Kaserne)
4. **Bavaria bases** (Grafenwöhr, Vilseck, Ansbach, Illesheim) — more spread out

## Status by base

### Stuttgart
Already had before outreach started: automotive, restaurants, hbb, healthcare
(12 listings total, see live DB).

| Category | Status |
|---|---|
| real-estate | ✅ 1 contacted (myLodge, 2026-08-21) |
| legal-business | ✅ 1 contacted (Schlun & Elseven, 2026-08-21) |
| education | ✅ 1 contacted (ISS, 2026-08-21) |
| shopping | ✅ 1 contacted (Modefriseur Mühlbauer, 2026-08-21) |
| home-services | ⏳ 1 attempted, no verified email (Stuttgart Expats Handyman) — needs 1-2 more leads |

**Next for Stuttgart:** more home-services leads, then round out the other
gap categories with a second lead each (one contact per category isn't
enough coverage) before moving to KMC.

### Kaiserslautern Military Community — not started
### Wiesbaden — not started
### Bavaria bases — not started

## Known issues (as of 2026-08-25)

Every scheduled run from 2026-08-21 through 2026-08-25 sent **zero**
emails — not a pacing problem, an infrastructure one. Two blockers,
both need the site owner to fix from outside this session:

1. **Network egress blocked.** The cloud sandbox's default egress
   policy only allows a small fixed set of domains (npm, PyPI,
   Anthropic's own APIs). `pkacbcohrygpyapgtzpq.supabase.co` and
   `european-living.live` are not on it, so the mandatory
   "check what's already live" step (procedure step 2 below) fails
   with `EGRESS_BLOCKED` before any research happens. Fix: add both
   domains to the Default environment's outbound allowlist in
   claude.ai's environment settings.
2. **No GitHub write access.** Cloning the repo works, but `git push`
   fails with a 403 ("Claude doesn't have GitHub access to
   TerryL1971/European-Living-Astro for your organization"). Fix:
   install the Claude GitHub App with write access
   (https://github.com/apps/claude/installations/select_target) or
   reconnect GitHub via claude.ai connectors
   (https://claude.ai/customize/connectors?auth_start=github&auth_start_force=1).

If this section is still here and a run is reading it: **do not
attempt to send anything until you've confirmed both the Supabase REST
endpoint and european-living.live are actually reachable** (a plain
`curl` to the Supabase URL below succeeding is enough to confirm). If
either is still blocked, stop immediately, log nothing as sent, and
report the same blocker rather than retrying — this has already been
diagnosed, no need to rediscover it each run.

## Daily run procedure (Mon-Fri only — the routine's cron does not fire on weekends)

1. Read `outreach/log.csv` — never re-contact a business already listed there.
2. Query the live `businesses` table (Supabase REST, anon key below) for the
   current base area to see what's already listed on-site — don't duplicate
   an existing confirmed listing either.
   ```
   URL: https://pkacbcohrygpyapgtzpq.supabase.co
   anon key: (see PUBLIC_SUPABASE_ANON_KEY in project .env — safe public key, RLS-protected)
   GET /rest/v1/businesses?select=name,category,bases_served
   ```
3. The goal is full coverage, not one token lead per category: for the
   current base area, research and build out a real list of every
   findable English-speaking / American-military-friendly business in
   each of the 9 categories, not just enough to check a box. Each run
   only sends a slice of that list (see pacing below) — log candidates
   you find but don't yet have time to email today as `researched` in
   `log.csv` (status column) so tomorrow's run can pick them up without
   re-researching from scratch, rather than re-discovering the same
   ground every day.
4. Pick 3-5 leads for today: prioritize whichever category in the
   current base area has the fewest listings (on-site + already-
   contacted combined), pulling from yesterday's `researched` rows
   first before finding new ones.
5. Research via web search — real business, real public contact email only.
   Never fabricate or guess an email address; if none is publicly listed,
   log it as `skipped_no_email` with a note on the alternative contact
   method (contact form, phone) and move to the next lead instead.
6. Send one personalized email per lead from european.living.live@gmail.com
   using the template in `outreach/email-template.md` — swap in the
   business name, category, and a one-line personalization specific to
   that business (never send the raw template unchanged).
7. Append each attempt to `outreach/log.csv` (sent, researched,
   skipped_no_email, or skipped_duplicate) and update the Status by
   base table above.
8. Commit and push the log/roadmap changes (small, routine commit —
   e.g. "Outreach: contact myLodge + 2 more, Stuttgart home-services").
9. When every category in the current base area has full, real
   coverage (not just 2 token contacts), mark that base done and move
   to the next one in priority order.
10. Send one short summary back to the user (who was contacted today,
    running total, current base/category) — don't wait for a reply
    before continuing on the next weekday, this runs autonomously per
    prior agreement with the user.

## Guardrails

- **3-5 sends per run, no more** — this is the deliberate anti-spam
  pacing the user asked for. Do not batch multiple days together to
  "catch up," even after a gap caused by an infrastructure blocker.
- **Weekdays only** — enforced by the routine's cron schedule
  (`0 7 * * 1-5`), not by this file; nothing to do here except not
  fight it if a run somehow fires on a weekend.
- Always personalize — never send an identical template twice in a row.
- Never invent a contact email. Skip and log instead.
- Never re-contact a business already in the log or already listed on-site.
- If Gmail send starts failing / bouncing repeatedly, stop and flag it to
  the user rather than continuing to send into a broken pipe.
- If Supabase or the live site is unreachable (see Known Issues above),
  stop before researching or sending anything — don't guess at what's
  already listed.
