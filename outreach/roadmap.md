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
| real-estate | ✅ 1 contacted (myLodge, 2026-08-21). 2 more researched, no email yet (Downtown Apartments Stuttgart, Moehringen Apartments — both near Kelley/Patch, contact-form only) |
| legal-business | ✅ 2 contacted (Schlun & Elseven 2026-08-21; vpmk Legal Services 2026-08-25) |
| education | ✅ 2 contacted (ISS 2026-08-21; German-American Center/DAZ 2026-08-25) |
| shopping | ✅ 1 contacted (Modefriseur Mühlbauer, 2026-08-21). 1 more researched, no email yet (americanfoodclub.de) |
| home-services | ✅ 1 contacted (Stuttgart Sparkle Services, 2026-08-25). 1 attempted no email (Stuttgart Expats Handyman); 1 more researched, no email yet (Move Clean Pros) |

**Next for Stuttgart:** find published contact emails for the researched-but-
unemailed real-estate/shopping/home-services leads above (try contact forms
or a follow-up search), then push each category toward 2-3 real contacts
before moving to KMC.

### Kaiserslautern Military Community — not started
### Wiesbaden — not started
### Bavaria bases — not started

## Known issues (as of 2026-08-25)

Runs from 2026-08-21 through 2026-08-25 sent **zero** emails — not a
pacing problem, an infrastructure one. Status as of the 2026-08-25
afternoon run:

1. **Network egress blocked — WORKED AROUND, not fixed.** The cloud
   sandbox's default egress policy only allows a small fixed set of
   domains (npm, PyPI, Anthropic's own APIs) and there is no
   self-service way to add domains to it (checked — no such setting
   exists in claude.ai's UI as of 2026-08-25). So: **do not attempt to
   curl or WebFetch `pkacbcohrygpyapgtzpq.supabase.co` or
   `european-living.live` — it will fail every time, don't waste turns
   rediscovering this.** Instead, use the committed snapshot at
   `outreach/businesses-snapshot.json` (refreshed periodically from
   outside this sandbox) as the source of truth for what's already
   listed on-site. It won't be perfectly live, but it's close enough
   for duplicate-avoidance — freshness within a week or two beats
   blocking entirely.
2. **GitHub write access — CONFIRMED WORKING as of the 2026-08-25
   afternoon run.** `git push -u origin main` succeeded (commit
   `dcf743b`), resolving the prior 403 ("Claude doesn't have GitHub
   access to TerryL1971/European-Living-Astro for your organization")
   after the site owner installed the Claude GitHub App. One wrinkle
   seen that run: the repo checked out in **detached HEAD** at
   `origin/main`'s tip rather than on a local `main` branch — commit
   directly and `git push` will fail confusingly (no upstream). Fix
   with `git checkout -B main origin/main` before committing. If a
   future run hits a 403 again, treat it as a real regression and
   report it plainly rather than assuming user error.

If item 1 above still says "worked around, not fixed," treat it as a
real constraint, not resolved
history — don't skip the workarounds below on the assumption someone
already fixed everything.

## Daily run procedure (Mon-Fri only — the routine's cron does not fire on weekends)

1. Read `outreach/log.csv` — never re-contact a business already listed there.
2. Read `outreach/businesses-snapshot.json` (committed snapshot of the
   live `businesses` table — see Known Issues #1 for why this is used
   instead of a live Supabase call) for the current base area to see
   what's already listed on-site — don't duplicate an existing
   confirmed listing either. Note the snapshot's age isn't stamped in
   the file itself; check `git log -1 --format=%ad -- outreach/businesses-snapshot.json`
   if you want to know how stale it is, but proceed either way — it's
   the best available data, not optional to skip.
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
- Do not attempt to curl or WebFetch Supabase or european-living.live
  directly — it's blocked (see Known Issues #1), don't burn turns
  rediscovering that. Use `outreach/businesses-snapshot.json` instead.
- If GitHub push fails with the same 403 as before, stop and report it
  plainly rather than assuming you did something wrong (see Known
  Issues #2) — don't keep retrying a policy/auth denial.
