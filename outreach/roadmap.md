# English Services Outreach — Roadmap

Ongoing outreach to English-speaking businesses near U.S. bases in Germany,
inviting them to a free listing on European Living's Services Directory.
Started 2026-08-21. Paced deliberately (1-2 emails/day) to avoid spam
flags on a brand-new sending account.

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

## Daily run procedure

1. Read `outreach/log.csv` — never re-contact a business already listed there.
2. Query the live `businesses` table (Supabase REST, anon key below) for the
   current base area to see what's already listed on-site — don't duplicate
   an existing confirmed listing either.
   ```
   URL: https://pkacbcohrygpyapgtzpq.supabase.co
   anon key: (see PUBLIC_SUPABASE_ANON_KEY in project .env — safe public key, RLS-protected)
   GET /rest/v1/businesses?select=name,category,bases_served
   ```
3. Pick 1-2 leads: prioritize whichever category in the current base area
   has the fewest listings (on-site + already-contacted combined).
4. Research via web search — real business, real public contact email only.
   Never fabricate or guess an email address; if none is publicly listed,
   log it as `skipped_no_email` with a note on the alternative contact
   method (contact form, phone) and move to the next lead instead.
5. Send one personalized email per lead from european.living.live@gmail.com
   using the template in `outreach/email-template.md` — swap in the
   business name, category, and a one-line personalization specific to
   that business (never send the raw template unchanged).
6. Append each attempt to `outreach/log.csv` (sent, skipped_no_email, or
   skipped_duplicate) and update the Status by base table above.
7. Commit and push the log/roadmap changes (small, routine commit —
   e.g. "Outreach: contact myLodge + 1 more, Stuttgart home-services").
8. When every category in the current base area has 2+ contacted leads,
   mark that base done and move to the next one in priority order.
9. Send one short summary back to the user (who was contacted today, running
   total, current base/category) — don't wait for a reply before continuing
   tomorrow, this runs autonomously per prior agreement with the user.

## Guardrails

- **1-2 sends per day, no more** — this is the deliberate anti-spam pacing
  the user asked for. Do not batch multiple days together to "catch up."
- Always personalize — never send an identical template twice in a row.
- Never invent a contact email. Skip and log instead.
- Never re-contact a business already in the log or already listed on-site.
- If Gmail send starts failing / bouncing repeatedly, stop and flag it to
  the user rather than continuing to send into a broken pipe.
