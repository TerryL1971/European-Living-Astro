// generate-sitemap.ts
// Run with: npx tsx generate-sitemap.ts
// Location: save this in the european-living-astro/ folder (project root,
// same level as package.json and astro.config.mjs).
//
// Regenerates public/sitemap.xml: keeps the hand-maintained static pages as
// well as-is, then appends one <url> per day_trips row (that actually has a
// slug — see note below) and one <url> per published article (any of the
// three real categories: City Guides, PCS Guides, Travel Tips — all of which
// live at /articles/:slug). Safe to re-run any time content changes — it
// always rebuilds the whole file from scratch rather than patching it.
//
// FIXES APPLIED WHILE PORTING FROM THE OLD REACT PROJECT:
//   1. Env vars renamed VITE_* -> PUBLIC_* (Astro's client-exposed prefix),
//      and now loads .env (this project's actual file) instead of .env.local.
//   2. City Guide destination URLs changed from /destinations/<slug> to
//      /articles/<slug>. /destinations/<slug> is now a 301 redirect (dead
//      route, nothing links to it) — sitemaps should list the final
//      canonical URL, never one that immediately redirects elsewhere.
//   3. Day trips with no slug are now EXCLUDED from the sitemap, rather than
//      falling back to their UUID as the URL. day-trips/[slug].astro's own
//      getStaticPaths() already filters out slugless trips (no page ever
//      gets built for them) — the old fallback was generating sitemap
//      entries for pages that don't exist, which is very likely why a
//      UUID-based day-trip URL ended up indexed by Google in the first
//      place.
//   4. Travel Tips articles were never fetched by the old script at all —
//      only City Guides and PCS Guides — silently leaving a third of the
//      real content categories out of the sitemap. Now fetches all
//      published articles in one pass, regardless of category, since all
//      three now share the same /articles/:slug destination.
//   5. Added the 9 /services/<category> pages, which exist now but were
//      never in the original sitemap.

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env' });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://www.european-living.live';
const OUTPUT_PATH = path.join('public', 'sitemap.xml');
const PAGE_SIZE = 1000; // PostgREST's default max rows per request

// Matches the category ids in ServicesCategoriesSection.tsx — kept as a
// separate list here (not imported) since this script runs standalone via
// tsx, outside Astro/Vite's module resolution.
const SERVICE_CATEGORY_SLUGS = [
  'automotive',
  'healthcare',
  'restaurants',
  'shopping',
  'home-services',
  'real-estate',
  'legal',
  'education',
  'business',
];

// ── Static pages — unchanged from the hand-maintained sitemap ─────────────
// If you add/remove a static route, edit this list. Everything below this
// block is generated automatically from Supabase on every run.
interface StaticEntry {
  comment: string;
  loc: string;
  changefreq: string;
  priority: string;
}

const STATIC_ENTRIES: StaticEntry[] = [
  { comment: 'Home', loc: '/', changefreq: 'weekly', priority: '1.0' },
  { comment: 'PCS Guide', loc: '/pcs-guide', changefreq: 'monthly', priority: '0.9' },
  { comment: 'Services Directory', loc: '/services-directory', changefreq: 'weekly', priority: '0.9' },
  { comment: 'Day Trips', loc: '/day-trips', changefreq: 'weekly', priority: '0.8' },
  { comment: 'Family Adventures', loc: '/family-adventures', changefreq: 'monthly', priority: '0.8' },
  { comment: 'About', loc: '/about', changefreq: 'monthly', priority: '0.7' },
  { comment: 'Submit a Business', loc: '/submit-business', changefreq: 'monthly', priority: '0.6' },
  { comment: 'Legal', loc: '/impressum', changefreq: 'yearly', priority: '0.3' },
  { comment: '', loc: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
  { comment: '', loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { comment: '', loc: '/contact', changefreq: 'yearly', priority: '0.3' },
];

interface DayTripRow {
  id: string;
  slug: string | null;
  updated_at: string | null;
}

interface ArticleRow {
  slug: string;
  category: string | null;
  updated_at: string | null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toLastmod(updatedAt: string | null): string | null {
  if (!updatedAt) return null;
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

/** Paginates through a table in chunks of PAGE_SIZE so this keeps working past 1k rows. */
async function fetchAll<T>(
  table: string,
  select: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFilters?: (query: any) => any
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    let query = supabase.from(table).select(select);
    if (applyFilters) query = applyFilters(query);
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) {
      console.error(`❌ Error fetching ${table}:`, error.message);
      throw error;
    }
    if (!data || data.length === 0) break;

    rows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

function buildUrlBlock(loc: string, changefreq: string, priority: string, lastmod?: string | null, comment?: string): string {
  const lines: string[] = [];
  if (comment) lines.push(`  <!-- ${comment} -->`);
  lines.push('  <url>');
  lines.push(`    <loc>${SITE_URL}${escapeXml(loc)}</loc>`);
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`);
  lines.push(`    <priority>${priority}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

async function main() {
  console.log('📡 Fetching day_trips from Supabase...');
  const allDayTrips = await fetchAll<DayTripRow>('day_trips', 'id, slug, updated_at');
  const dayTrips = allDayTrips.filter((t) => Boolean(t.slug));
  const skippedDayTrips = allDayTrips.length - dayTrips.length;
  console.log(`   → ${dayTrips.length} day trip(s) with a slug found`);
  if (skippedDayTrips > 0) {
    console.log(`   ⚠️  Skipped ${skippedDayTrips} day trip(s) with no slug — no page is built for these, so they're excluded from the sitemap.`);
  }

  console.log('📡 Fetching all published articles (City Guides, PCS Guides, Travel Tips) from Supabase...');
  const articles = await fetchAll<ArticleRow>('articles', 'slug, category, updated_at', (q) =>
    q.eq('published', true)
  );
  console.log(`   → ${articles.length} article(s) found across all categories`);

  const blocks: string[] = [];

  for (const entry of STATIC_ENTRIES) {
    blocks.push(buildUrlBlock(entry.loc, entry.changefreq, entry.priority, null, entry.comment || undefined));
  }

  blocks.push('\n  <!-- Services Category Pages -->');
  for (const slug of SERVICE_CATEGORY_SLUGS) {
    blocks.push(buildUrlBlock(`/services/${slug}`, 'monthly', '0.6'));
  }

  if (dayTrips.length > 0) {
    blocks.push('\n  <!-- Day Trip Detail Pages (auto-generated from Supabase: day_trips) -->');
  }
  for (const trip of dayTrips) {
    blocks.push(buildUrlBlock(`/day-trips/${trip.slug}`, 'monthly', '0.6', toLastmod(trip.updated_at)));
  }

  if (articles.length > 0) {
    blocks.push('\n  <!-- Article Pages (auto-generated from Supabase: articles — City Guides, PCS Guides, Travel Tips) -->');
  }
  for (const article of articles) {
    // City Guides (destination content) get a slightly lower priority than
    // PCS Guides/Travel Tips, matching the old script's relative weighting.
    const priority = article.category === 'City Guides' ? '0.6' : '0.8';
    blocks.push(buildUrlBlock(`/articles/${article.slug}`, 'monthly', priority, toLastmod(article.updated_at)));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${blocks.join('\n\n')}\n\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');

  const total = STATIC_ENTRIES.length + SERVICE_CATEGORY_SLUGS.length + dayTrips.length + articles.length;
  console.log(`✅ Wrote ${OUTPUT_PATH} with ${total} URLs`);
  console.log(`   (${STATIC_ENTRIES.length} static + ${SERVICE_CATEGORY_SLUGS.length} service categories + ${dayTrips.length} day trips + ${articles.length} articles)`);
  console.log('👉 Don\'t forget to resubmit the sitemap in Google Search Console after deploying.');
}

main().catch((err) => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});