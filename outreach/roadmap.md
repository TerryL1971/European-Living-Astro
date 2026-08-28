# English Services Outreach — Roadmap

Ongoing outreach to English-speaking businesses near U.S. bases in Germany,
inviting them to a free listing on European Living's Services Directory.
Started 2026-08-21. Since 2026-08-28 each run also does a lightweight
**still-in-business verification** pass — every new lead is web-checked
before it gets an email, and a few existing directory listings are
re-checked per run — so the directory doesn't accumulate dead listings.
Paced deliberately (3-5 emails/run, weekdays only) to
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
| real-estate | ✅ 4 contacted (myLodge 2026-08-21; Stuttgart Furnished Apartments/stuttgart-apts.com, Executive Suites Stuttgart, Stephan Immobilien — all 2026-08-26). 2 still no email (Downtown Apartments Stuttgart, Moehringen Apartments — both near Kelley/Patch, contact-form only, searched again 2026-08-26, still nothing published) |
| legal-business | ✅ 2 contacted (Schlun & Elseven 2026-08-21; vpmk Legal Services 2026-08-25) |
| education | ✅ 2 contacted (ISS 2026-08-21; German-American Center/DAZ 2026-08-25) |
| shopping | ✅ 4 contacted (Modefriseur Mühlbauer 2026-08-21; Piccadilly English Shop, American Store Stuttgart, World of Candy Stuttgart/Milaneo — all 2026-08-27). americanfoodclub.de confirmed Frankfurt-based (Offenbach), not a Stuttgart fit — leave for a future Frankfurt/Wiesbaden run. 3 more found with no published email (English Books Handwerkstr. 50, US-Shop Vaihinger Markt 14, Patch Thrift Shop — base-access-only nonprofit, poor directory fit regardless) |
| home-services | ✅ 2 contacted (Stuttgart Sparkle Services 2026-08-25; SPIC AND SPAN 2026-08-26). 2 still no email (Stuttgart Expats Handyman, Move Clean Pros — searched again 2026-08-26, still nothing published) |

**Next for Stuttgart:** shopping now has 4 real contacts — every category has
genuine depth (automotive/healthcare/restaurants/hbb already solid pre-outreach;
real-estate 4; legal-business 2; education 2; shopping 4; home-services 2).
Stuttgart coverage is solid enough to move on. **Starting next run, shift
focus to Kaiserslautern Military Community (KMC)** — Stuttgart's two
still-no-email leads (Stuttgart Expats Handyman, Move Clean Pros in
home-services) can get one more follow-up search opportunistically but
shouldn't block moving on.

### Kaiserslautern Military Community — in progress (started 2026-08-28 run)
Already had before outreach started: automotive only (The Used Car Guys - Kaiserslautern,
The Used Car Guys - Ramstein, American Business Center — all pre-existing listings,
see snapshot). All other 8 categories start from zero.

| Category | Status |
|---|---|
| real-estate | ✅ 4 contacted 2026-08-28 (ImmoHauf, Premium Realestate/David Baker, Prime TLA, Stay Eden). 3 more researched with verified emails, queued for a future run (Roth TLA, TLA Office, TLA Ramstein/DODSC) |
| automotive | Pre-existing (3 listings) — solid, no action needed yet |
| healthcare | Not started |
| restaurants | Not started |
| shopping | Not started |
| home-services | Not started |
| legal-business | Not started |
| education | Not started |
| hbb | Not started |

**Next for KMC:** real-estate has a strong start (4 sent + 3 queued). Next run
should either finish real-estate's queued 3, or open a second category
(healthcare or home-services are good next picks — both are common PCS-week
needs) — full coverage is still a long way off, this base needs many more
runs.

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

## Still-in-business verification

Goal: keep the live directory free of businesses that have permanently
closed, moved away from the base area, or lost their English-speaking
service. This runs as part of every outreach run — it is not a separate
routine.

**Two checks per run:**

1. **New leads (blocking) — always.** Before emailing any new lead,
   confirm via web search that it's a real, currently-operating
   business: its own website resolves and isn't parked/expired, and its
   Google Maps / Google Business listing is **not** marked "Permanently
   closed" or "Temporarily closed". If it looks closed, do **not**
   email — log it in `outreach/log.csv` as `skipped_closed` with a note,
   and move to the next lead.

2. **Existing listings (sampling) — 3-5 per run.** Pick 3-5 businesses
   from `outreach/businesses-snapshot.json` (prefer `is_visible: true`,
   `consent_status: confirmed`) that are **not** already in
   `outreach/verification-log.csv` with a check in the last ~90 days.
   Rotate through base areas / categories so coverage stays even. For
   each, do the same web check as above, plus a quick sanity look at
   recent reviews (any from the last 6-12 months = clearly still open).

**Recording results** — append every existing-listing check to
`outreach/verification-log.csv` (columns:
`date,business_name,category,base_area,result,evidence`), where `result`
is one of:

- `open` — website live and/or recent reviews, no closure flag
- `likely_closed` — Maps says permanently closed, or website dead **and**
  no activity found anywhere
- `unclear` — couldn't confirm either way (no website, no Maps listing,
  no recent reviews); note what was checked
- `moved` — still operating but no longer serves the base area / no
  longer offers English service

**On a `likely_closed` or `moved` result:** flag it to the user in the
run's summary (business name, base, category, and the evidence). Do
**not** attempt to edit the live site or Supabase — site egress is
blocked from the sandbox (see Known Issues #1), and removing a listing
is the owner's call anyway. The user decides what to remove.

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
5a. **Verify each lead is still open** before emailing (see
   "Still-in-business verification" → check 1). If it looks permanently
   or long-term closed, log `skipped_closed` and move on — don't email it.
5b. **Verify 3-5 existing listings** (see "Still-in-business verification"
   → check 2). Append each to `outreach/verification-log.csv`. If any
   come back `likely_closed` or `moved`, note them for the step 10
   summary.
6. Send one personalized email per lead from european.living.live@gmail.com
   using the template in `outreach/email-template.md` — swap in the
   business name, category, and a one-line personalization specific to
   that business (never send the raw template unchanged).
7. Append each attempt to `outreach/log.csv` (sent, researched,
   skipped_no_email, skipped_duplicate, or skipped_closed) and update
   the Status by base table above.
8. Commit and push the log/roadmap/verification-log changes (small,
   routine commit — e.g. "Outreach: contact myLodge + 2 more, Stuttgart
   home-services; verify 4 listings").
9. When every category in the current base area has full, real
   coverage (not just 2 token contacts), mark that base done and move
   to the next one in priority order.
10. Send one short summary back to the user (who was contacted today,
    running total, current base/category, plus which existing listings
    were verified and **any `likely_closed` / `moved` results with their
    evidence** so the user can decide whether to remove them) — don't
    wait for a reply before continuing on the next weekday, this runs
    autonomously per prior agreement with the user.

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
- **Verification is read-only** — web search only. Never email a business
  just to ask if it's still open, and never try to edit the live site or
  Supabase to remove a listing. Flag closures to the user; they decide.
- Don't mark a listing `likely_closed` on weak evidence. A missing
  website alone is `unclear`, not closed — you need a Maps "permanently
  closed" flag, or a dead site plus no trace of recent activity anywhere.
- Verification is capped at ~5 existing listings per run — it's a slow
  rolling sweep, not a bulk audit. Don't batch to "catch up."
- If Gmail send starts failing / bouncing repeatedly, stop and flag it to
  the user rather than continuing to send into a broken pipe.
- Do not attempt to curl or WebFetch Supabase or european-living.live
  directly — it's blocked (see Known Issues #1), don't burn turns
  rediscovering that. Use `outreach/businesses-snapshot.json` instead.
- If GitHub push fails with the same 403 as before, stop and report it
  plainly rather than assuming you did something wrong (see Known
  Issues #2) — don't keep retrying a policy/auth denial.
