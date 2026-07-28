// src/data/bases.ts
//
// CONSOLIDATION NOTE: the original codebase had two separate definitions
// of this same list — BaseSelectionModal.tsx defined its own inline
// BASES array (id/name/location/region/icon/description), while
// BaseSelector.tsx imported a differently-shaped BASES from this path
// (id/name/location/nearbyTowns). Rather than preserve two
// out-of-sync copies of "the list of bases," this file is the one
// shared source both components import from. `nearbyTowns` values
// below are a reasonable best guess — worth reviewing/adjusting.

export interface Base {
  id: string;
  name: string;
  location: string;
  region: string;
  icon: string;
  description: string;
  nearbyTowns: string[];
}

export const BASES: Base[] = [
  {
    id: 'ramstein',
    name: 'Ramstein Air Base',
    location: 'Ramstein-Miesenbach',
    region: 'Rhineland-Palatinate',
    icon: '✈️',
    description: 'Largest USAF base in Europe',
    nearbyTowns: ['Kaiserslautern', 'Landstuhl', 'Weilerbach'],
  },
  {
    id: 'stuttgart',
    name: 'USAG Stuttgart',
    location: 'Stuttgart',
    region: 'Baden-Württemberg',
    icon: '🏛️',
    description: 'Home to EUCOM and AFRICOM headquarters',
    nearbyTowns: ['Böblingen', 'Sindelfingen', 'Vaihingen'],
  },
  {
    id: 'kaiserslautern',
    name: 'Kaiserslautern Area',
    location: 'Kaiserslautern',
    region: 'Rhineland-Palatinate',
    icon: '🏰',
    description: 'Heart of the KMC – Kaiserslautern Military Community',
    nearbyTowns: ['Landstuhl', 'Ramstein-Miesenbach', 'Weilerbach'],
  },
  {
    id: 'wiesbaden',
    name: 'USAG Wiesbaden',
    location: 'Wiesbaden',
    region: 'Hesse',
    icon: '🏢',
    description: 'Near Frankfurt, Army base and community',
    nearbyTowns: ['Mainz', 'Frankfurt', 'Hofheim'],
  },
  {
    id: 'grafenwoehr',
    name: 'USAG Bavaria',
    location: 'Grafenwöhr',
    region: 'Bavaria',
    icon: '⚔️',
    description: 'Training area and large Army garrison',
    nearbyTowns: ['Vilseck', 'Weiden', 'Eschenbach'],
  },
  {
    id: 'spangdahlem',
    name: 'Spangdahlem Air Base',
    location: 'Spangdahlem',
    region: 'Rhineland-Palatinate',
    icon: '🛩️',
    description: 'USAF base near Bitburg',
    nearbyTowns: ['Bitburg', 'Trier', 'Wittlich'],
  },
];
