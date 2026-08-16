// src/data/bases.ts
//
// Shared base lookup — used by BaseSelectionModal.tsx (icon/location/
// region/description, for the base-picker cards) and by the day-trips
// and business-admin code (id/name only, via getBaseName()).
//
// NOTE: icon/location/region/description below are reconstructed —
// BaseSelectionModal.tsx was already written expecting these fields
// from a shared bases.ts, but the version created earlier in this
// migration only had id/name (that's all the day-trips work needed),
// which broke this modal. If you have the original copy in git
// history (git log -p -- src/data/bases.ts), worth checking against
// this for exact original wording.

export const BASES = [
  {
    id: 'ramstein',
    name: 'Ramstein AB',
    icon: '✈️',
    location: 'Ramstein-Miesenbach',
    region: 'Rhineland-Palatinate',
    description: 'Home to Ramstein Air Base and NATO Allied Air Command',
  },
  {
    id: 'stuttgart',
    name: 'USAG Stuttgart',
    icon: '⭐',
    location: 'Stuttgart',
    region: 'Baden-Württemberg',
    description: 'Home to EUCOM, AFRICOM, and Patch Barracks',
  },
  {
    id: 'kaiserslautern',
    name: 'KMC Area',
    icon: '🎖️',
    location: 'Kaiserslautern',
    region: 'Rhineland-Palatinate',
    description: 'The largest American military community outside the U.S.',
  },
  {
    id: 'wiesbaden',
    name: 'USAG Wiesbaden',
    icon: '🏢',
    location: 'Wiesbaden',
    region: 'Hesse',
    description: 'Home to U.S. Army Europe and Africa headquarters',
  },
  {
    id: 'grafenwoehr',
    name: 'USAG Bavaria',
    icon: '🏔️',
    location: 'Grafenwöhr',
    region: 'Bavaria',
    description: 'Major U.S. Army training area in Bavaria',
  },
  {
    id: 'spangdahlem',
    name: 'Spangdahlem AB',
    icon: '✈️',
    location: 'Spangdahlem',
    region: 'Rhineland-Palatinate',
    description: 'Home to the 52nd Fighter Wing',
  },
] as const;

export function getBaseName(id: string): string {
  return BASES.find((b) => b.id === id)?.name ?? id;
}