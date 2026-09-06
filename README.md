# European Living

Practical, up-to-date guidance for **U.S. military families and American expats living near U.S. bases in Germany** — housing allowances, driver's licenses, healthcare, schools, English-speaking services, and family day trips.

🌐 **Live site:** [www.european-living.live](https://www.european-living.live)

<p>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white">
</p>

---

## Overview

European Living is a content-heavy resource site covering seven U.S. installation areas
in Germany — **USAG Stuttgart, Ramstein / KMC, USAG Wiesbaden, USAG Bavaria (Grafenwöhr),
Spangdahlem, USAG Baumholder**, and the wider Kaiserslautern Military Community. Visitors
pick their base once and the site filters services, day trips, and guides to what's
relevant to them.

It was migrated from a client-rendered React SPA to Astro to get static, pre-rendered
HTML on every route — faster first paint, resilient navigation, and clean crawlability
for search and answer engines — while keeping React for the genuinely interactive parts.

### What's on the site

| Area | Description |
| --- | --- |
| **Destination & travel guides** | ~80 long-form articles: city guides, PCS logistics, banking, healthcare, schooling, driver's licenses, SOFA status |
| **PCS Guide** | Phase-by-phase moving timeline, key contacts, and FAQ for a permanent-change-of-station move |
| **Services directory** | English-speaking local businesses across 9 categories, filterable by base, with maps and reviews |
| **Day trips** | Curated trips within driving distance of each base, with an interactive map |
| **Family adventures** | Kid-friendly outings |
| **Travel phrases** | Searchable German phrasebook |
| **Community submissions** | Forms for locals to submit a business or a destination |
| **Admin** | Client-gated pages for business data entry and featured-content management |

---

## Tech stack

- **[Astro 7](https://astro.build)** — static output (`output: 'static'`); every route is
  pre-rendered HTML. Only `/admin/*` opts into on-demand rendering.
- **[React 19](https://react.dev)** islands — hydrated selectively (`client:load` /
  `client:idle` / `client:visible`) for the header, base selector, forms, maps, and
  filtered lists.
- **[Tailwind CSS 4](https://tailwindcss.com)** via the Vite plugin, plus a small
  editorial type system in `src/styles/global.css`.
- **[Supabase](https://supabase.com)** (Postgres) — the content store for articles,
  businesses, day trips, destinations, featured content, and reviews. Auth gates the
  admin pages.
- **[nanostores](https://github.com/nanostores/nanostores)** — the shared "selected base"
  state, read across islands.
- **[Leaflet](https://leafletjs.com) / react-leaflet** — maps on business and day-trip pages.
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** — sitemap generation.
- **GA4 + [Sentry](https://sentry.io)** — analytics and error monitoring, both gated
  behind cookie consent and disabled in dev.
- **[Vercel](https://vercel.com)** — hosting, via `@astrojs/vercel`.

---

## Architecture

### Two Supabase execution contexts

Content is fetched from Supabase in **two different places**, and it matters which:

| Context | Files | Runs | Purpose |
| --- | --- | --- | --- |
| **Build time (Node)** | `src/lib/supabase*.ts` | during `astro build`, in `getStaticPaths()` and page frontmatter | Generates every static page — one HTML file per article, business, day trip, destination |
| **Runtime (browser)** | `src/services/supabaseClient.ts` | in the visitor's browser, inside React islands | Fetches data that changes more often than the rebuild cadence (e.g. live review counts) |

Both use the same `PUBLIC_SUPABASE_*` env vars — Astro inlines `import.meta.env.PUBLIC_*`
into the client bundle, so the anon key works identically in Node and the browser.

To publish new or edited Supabase content, **trigger a rebuild** (a redeploy on Vercel).

### Navigation

`<ClientRouter />` (View Transitions) was **removed** — it shipped broken UX on real
devices. Every route is static HTML with immutably-cached `/_astro` assets, so plain
full-page navigation only fetches a small gzipped HTML document. `prefetch: true` warms
that fetch on link hover/focus. A tiny compat shim in `BaseLayout.astro` still fires a
one-shot `astro:page-load` event so island setup scripts written for the router keep working.

### SEO

`src/lib/seo/siteConfig.ts` is the single source of truth for site identity — meta tags
and JSON-LD (`Organization` + `WebSite` on every page, page-specific schemas passed via
`pageSchemas`) both read from it, so the `<head>` and the structured data never disagree.
Security headers, caching rules, and legacy URL redirects live in `vercel.json`.

---

## Project structure

```
src/
├── pages/               # File-based routes (24 pages)
│   ├── articles/[slug]  # ─┐
│   ├── businesses/[slug]#  ├─ dynamic routes, paths from getStaticPaths()
│   ├── day-trips/[slug] #  │  → one static HTML page each
│   ├── destinations/[slug] ┘
│   ├── services/[category]
│   └── admin/           # client-gated (AdminAuthWrapper)
├── layouts/
│   └── BaseLayout.astro # <head>, header, footer, consent, web-vitals
├── components/
│   ├── page/            # homepage sections + header/footer
│   ├── pcs-guide/       # PCS timeline, FAQ, contacts
│   ├── seo/             # SeoHead, Breadcrumbs, FaqBlock, AnswerBox
│   ├── articles/        # TableOfContents
│   ├── admin/           # BusinessDataEntry, FeaturedContentAdmin
│   └── ui/              # button, card
├── lib/                 # build-time Supabase fetchers + SEO helpers
│   ├── supabaseArticles.ts, supabaseDayTrips.ts, supabaseBases.ts, siteStats.ts
│   └── seo/             # schema.ts, siteConfig.ts
├── services/            # runtime (browser) Supabase + feature services
├── stores/              # baseStore.ts (nanostores)
├── data/                # static data: bases, service categories, PCS content
├── styles/global.css    # Tailwind entry + editorial type system
└── _deferred/           # parked, working components not currently wired in

supabase/migrations/     # SQL migrations (bases table)
public/                  # favicons, manifest, OG image, robots.txt, hero images
```

---

## Getting started

### Prerequisites

- **Node.js ≥ 22.12** (`engines` field in `package.json`)
- A Supabase project with the expected schema (articles, businesses, day_trips,
  destinations, featured_content, reviews, bases)

### Setup

```sh
git clone https://github.com/TerryL1971/European-Living-Astro.git
cd European-Living-Astro
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:4321
```

### Environment variables

`.env`, in the project root — Astro needs the `PUBLIC_` prefix (not `VITE_`) for
client-exposed vars:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (build **and** runtime) |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (build **and** runtime) |
| `PUBLIC_GA4_ID` | — | GA4 measurement ID; analytics no-op without it and in dev |
| `PUBLIC_SENTRY_DSN` | — | Sentry DSN; error monitoring no-op without it |
| `SUPABASE_ACCESS_TOKEN` | — | For running Supabase CLI migrations locally |

---

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build → `dist/` (fetches all Supabase content, generates the sitemap) |
| `npm run preview` | Serve the production build locally |
| `npm run astro ...` | Astro CLI (`astro add`, `astro check`, …) |

---

## Deployment

Deployed on **Vercel** via `@astrojs/vercel`. Each deploy runs a full `astro build`, so
the published site reflects Supabase content **as of the last build** — redeploy to
publish content changes. `vercel.json` adds security headers, long-lived caching for
hashed assets, and 301 redirects for URLs that changed during the migration.

---

## License

All rights reserved. Content and code © European Living.
