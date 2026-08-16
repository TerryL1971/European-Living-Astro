// Build-time data access for static day-trip pages.
// Matches the real public.day_trips schema exactly.
//
// PHASE 2 of the bases_served migration (see migration doc): base_id
// and base_name columns are dropped and duplicate per-base rows are
// merged — bases_served is now the only source of base data. Deploy
// this only after running the Phase 2 DROP COLUMN migration and
// confirming the redirects for the removed slugs are live.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface DayTripRow {
  id: string;
  bases_served: string[];
  name: string;
  slug: string | null;
  distance: string;
  drive_time: string;
  train_time: string | null;
  description: string;
  short_description: string | null;
  full_description: string | null;
  best_for: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  cost: '$' | '$$' | '$$$';
  image_url: string | null;
  hero_image_url: string | null;
  featured: boolean | null;
  is_must_see: boolean | null;
  rating: number | null;
  recommended_duration: string | null;
  food_info: string | null;
  ticket_info: string | null;
  official_website: string | null;
  latitude: number | null;
  longitude: number | null;
  what_to_see: string | null;
  local_tips: string | null;
  best_time_to_visit: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches every day trip that has a slug (rows without one can't get a
 * static route) for getStaticPaths(). Falls back to sample content when
 * Supabase env vars aren't set, so `astro dev`/`astro build` work in a
 * fresh checkout before .env is filled in.
 */
export async function getAllDayTrips(): Promise<DayTripRow[]> {
  if (!supabase) {
    return SAMPLE_DAY_TRIPS;
  }

  const { data, error } = await supabase
    .from('day_trips')
    .select('*')
    .not('slug', 'is', null);

  if (error) {
    console.error('Supabase day_trips fetch failed, falling back to sample data:', error.message);
    return SAMPLE_DAY_TRIPS;
  }

  return (data as DayTripRow[]) ?? [];
}

// Dev/fallback sample only — replace by populating Supabase, don't ship this.
const SAMPLE_DAY_TRIPS: DayTripRow[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    bases_served: ['stuttgart'],
    name: 'Strasbourg',
    slug: 'strasbourg-canals',
    distance: '85 mi',
    drive_time: '1h 30m',
    train_time: '1h 10m',
    description: 'A half-French, half-German canal city just across the border.',
    short_description:
      'Strasbourg pairs French cafe culture with Alsatian half-timbered houses along its canal district, about 90 minutes from Stuttgart.',
    full_description:
      '<p>Strasbourg sits right on the France-Germany border, and it shows — expect French bakeries next to Alsatian half-timbered houses, all wrapped around a canal district that\'s easy to explore on foot in a single day.</p>',
    best_for: ['Day trips', 'Photography', 'Food'],
    difficulty: 'Easy',
    cost: '$$',
    image_url: null,
    hero_image_url: null,
    featured: true,
    is_must_see: true,
    rating: 4.6,
    recommended_duration: 'Full day',
    food_info: 'Try tarte flambée (flammkuchen) at a canal-side winstub.',
    ticket_info: 'Cathedral entry is free; the astronomical clock show is a small separate fee.',
    official_website: 'https://www.visitstrasbourg.fr/en/',
    latitude: 48.5734,
    longitude: 7.7521,
    what_to_see: 'Petite France canal district, Strasbourg Cathedral, the European Parliament building.',
    local_tips: 'Park in a P+R (park and ride) outside the center and tram in — parking downtown is scarce and expensive.',
    best_time_to_visit: 'Late spring through early fall; the Christmas market (late Nov–Dec) is also worth the crowds.',
    created_at: '2025-11-23T16:12:12.784Z',
    updated_at: '2025-11-23T16:12:12.784Z',
  },
];