// src/data/bases.ts
//
// Shared base lookup — used by BaseSelectionModal.tsx (icon/location/
// region/description, for the base-picker cards) and by the day-trips
// and business-admin code (id/name via getBaseName(), coords via
// getBaseCoords()).
//
// `lat`/`lng` are the base/kaserne locations, used to compute the
// "≈ drive from your base" estimate on /day-trips (each day_trip row
// carries its own latitude/longitude in Supabase).
//
// The Supabase `public.bases` table (see supabase/migrations/) is the
// source of truth for the coordinates — lib/supabaseBases.ts reads it at
// build time. The values here are the FALLBACK (fresh checkout / CI with
// no Supabase env, or a transient fetch failure). Keep them in sync.

export const BASES = [
  {
    id: 'ramstein',
    name: 'Ramstein AB',
    icon: '✈️',
    location: 'Ramstein-Miesenbach',
    region: 'Rhineland-Palatinate',
    description: 'Home to Ramstein Air Base and NATO Allied Air Command',
    lat: 49.4369,
    lng: 7.6003,
  },
  {
    id: 'stuttgart',
    name: 'USAG Stuttgart',
    icon: '⭐',
    location: 'Stuttgart',
    region: 'Baden-Württemberg',
    description: 'Home to EUCOM, AFRICOM, and Patch Barracks',
    // Patch Barracks, Stuttgart-Vaihingen
    lat: 48.7447,
    lng: 9.0949,
  },
  {
    id: 'kaiserslautern',
    name: 'KMC Area',
    icon: '🎖️',
    location: 'Kaiserslautern',
    region: 'Rhineland-Palatinate',
    description: 'The largest American military community outside the U.S.',
    // Pulaski / Kleber Kaserne area
    lat: 49.4275,
    lng: 7.748,
  },
  {
    id: 'wiesbaden',
    name: 'USAG Wiesbaden',
    icon: '🏢',
    location: 'Wiesbaden',
    region: 'Hesse',
    description: 'Home to U.S. Army Europe and Africa headquarters',
    // Clay Kaserne / Wiesbaden Army Airfield, Erbenheim
    lat: 50.0498,
    lng: 8.3253,
  },
  {
    id: 'grafenwoehr',
    name: 'USAG Bavaria',
    icon: '🏔️',
    location: 'Grafenwöhr',
    region: 'Bavaria',
    description: 'Major U.S. Army training area in Bavaria',
    // Tower Barracks, Grafenwöhr
    lat: 49.6994,
    lng: 11.9403,
  },
  {
    id: 'spangdahlem',
    name: 'Spangdahlem AB',
    icon: '✈️',
    location: 'Spangdahlem',
    region: 'Rhineland-Palatinate',
    description: 'Home to the 52nd Fighter Wing',
    lat: 49.9727,
    lng: 6.6925,
  },
  {
    id: 'baumholder',
    name: 'USAG Baumholder',
    icon: '🪖',
    location: 'Baumholder',
    region: 'Rhineland-Palatinate',
    description: 'Home to Smith Barracks and the 16th Sustainment Brigade',
    // Smith Barracks
    lat: 49.615,
    lng: 7.298,
  },
] as const;

export function getBaseName(id: string): string {
  return BASES.find((b) => b.id === id)?.name ?? id;
}

/** [lat, lng] for a base id, or null for an unknown / "all" id. */
export function getBaseCoords(id: string): [number, number] | null {
  const b = BASES.find((x) => x.id === id);
  return b ? [b.lat, b.lng] : null;
}

/** { id: [lat, lng] } for every base — handy for serialising to the client. */
export const BASE_COORDS: Record<string, [number, number]> = Object.fromEntries(
  BASES.map((b) => [b.id, [b.lat, b.lng]]),
);