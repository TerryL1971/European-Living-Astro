// src/lib/siteStats.ts
//
// Build-time site-wide stat counters (day trips, destinations,
// businesses, phrases, bases, years) shown in HeroSection.astro and
// Footer.astro.
//
// Uses Supabase's `count: 'exact', head: true` query mode, which
// returns only a row count without fetching the actual row data —
// far cheaper than fetching every row just to read .length.
//
// Astro's build runs every page within the same Node process, so the
// module-level cache below means the Supabase count queries run only
// ONCE per full site build, not once per page — there are 40+ pages
// (Hero on the homepage, Footer on literally every page) that would
// otherwise each trigger their own redundant queries for the exact
// same numbers.
//
// Day trips, destinations and bases are shown as exact counts (no
// rounding), matching the site's existing convention ("33 Day Trips",
// "6 Bases" — small, precise numbers the site already touts exactly).
// Businesses and
// phrases are rounded DOWN to a milestone threshold with a "+", per
// the same convention as the current "200+ Businesses" / "1,200+
// Phrases" — this reads as a stable, confident milestone rather than
// a raw, fluctuating database count, and rounding down means the
// stated number is always true even as new rows get added.

import { createClient } from '@supabase/supabase-js';
import { BASES } from '../data/bases';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface SiteStats {
  dayTripsLabel: string;
  destinationsLabel: string;
  businessesLabel: string;
  phrasesLabel: string;
  articlesLabel: string;
  basesLabel: string;
  yearsLabel: string;
  /** Raw day-trip count, for inline prose ("Explore 44 day trips"). */
  dayTripsCount: number;
}

/**
 * Rounds a count DOWN to a clean milestone threshold and formats it
 * with a "+" — e.g. 214 -> "200+", 1247 -> "1,200+", 33 -> "30+".
 * Step size grows with magnitude so small counts don't round to
 * zero and large counts don't look falsely precise.
 */
function roundDownWithPlus(count: number): string {
  if (count <= 0) return '0';
  let step: number;
  if (count < 100) step = 10;
  else if (count < 1000) step = 50;
  else step = 100;
  const rounded = Math.floor(count / step) * step;
  return `${rounded.toLocaleString('en-US')}+`;
}

async function countRows(
  table: string,
  filters: Record<string, string | boolean> = {}
): Promise<number> {
  if (!supabase) return 0;
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  const { count, error } = await query;
  if (error) {
    console.error(`siteStats: failed to count ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

let cachedStats: Promise<SiteStats> | null = null;

export function getSiteStats(): Promise<SiteStats> {
  if (!cachedStats) {
    cachedStats = (async () => {
      const [dayTripsCount, destinationsCount, businessesCount, phrasesCount, articlesCount] =
        await Promise.all([
          countRows('day_trips'),
          // Destinations = published articles in the "City Guides"
          // category — same definition as getAllDestinationArticles()
          // in lib/supabaseArticles.ts, which feeds the homepage
          // destinations carousel and the /destinations page.
          countRows('articles', { published: true, category: 'City Guides' }),
          countRows('businesses', { status: 'active' }),
          countRows('phrases'),
          countRows('articles', { published: true }),
        ]);

      // Confirmed 2026-07-28: "years serving" counts from 2016, when
      // Terry moved to Germany — not a separate "site founding" date.
      const FOUNDING_YEAR = 2016;
      const years = Math.max(1, new Date().getFullYear() - FOUNDING_YEAR);

      return {
        dayTripsLabel: `${dayTripsCount} Day Trip${dayTripsCount === 1 ? '' : 's'}`,
        destinationsLabel: `${destinationsCount} Destination${destinationsCount === 1 ? '' : 's'}`,
        businessesLabel: `${roundDownWithPlus(businessesCount)} Businesses`,
        phrasesLabel: `${roundDownWithPlus(phrasesCount)} Phrases`,
        articlesLabel: `${roundDownWithPlus(articlesCount)} Articles`,
        basesLabel: `${BASES.length} Base${BASES.length === 1 ? '' : 's'}`,
        yearsLabel: `${years}+ Year${years === 1 ? '' : 's'}`,
        dayTripsCount,
      };
    })();
  }
  return cachedStats;
}