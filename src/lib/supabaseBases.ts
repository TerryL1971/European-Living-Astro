// Build-time access to the `bases` table (id, name, lat, lng).
//
// The table is the source of truth for base coordinates; data/bases.ts
// keeps a hardcoded copy as the fallback so `astro dev` / CI still build
// in a fresh checkout with no Supabase env, and so a transient fetch
// failure can't break the day-trips page. Same pattern as
// supabaseDayTrips.ts.
//
// Only the /day-trips drive estimate reads this. Since that page is
// static, a coordinate edit in Supabase shows up on the next deploy.

import { supabase } from './supabaseDayTrips';
import { BASES } from '../data/bases';

export type BaseCoordMap = Record<string, [number, number]>;

const fallbackMap: BaseCoordMap = Object.fromEntries(
  BASES.map((b) => [b.id, [b.lat, b.lng] as [number, number]]),
);

/** { baseId: [lat, lng] } — DB rows merged over the data/bases.ts fallback. */
export async function getBaseCoordMap(): Promise<BaseCoordMap> {
  if (!supabase) return fallbackMap;

  const { data, error } = await supabase.from('bases').select('id, lat, lng');
  if (error || !data || data.length === 0) {
    if (error) {
      console.error('bases fetch failed, using data/bases.ts fallback:', error.message);
    }
    return fallbackMap;
  }

  const map: BaseCoordMap = { ...fallbackMap };
  for (const row of data as { id: string; lat: number; lng: number }[]) {
    if (typeof row.lat === 'number' && typeof row.lng === 'number') {
      map[row.id] = [row.lat, row.lng];
    }
  }
  return map;
}
