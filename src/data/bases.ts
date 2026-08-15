// src/data/bases.ts
//
// Shared base id -> display name lookup. Same six bases used inline in
// BusinessDataEntry.tsx's BASES constant — pulled out here so day-trip
// code (and anything else needing to resolve a bases_served id array
// to display names) has one canonical source instead of redeclaring
// the list. BusinessDataEntry.tsx's inline copy is a candidate to
// switch over to this later; not touched as part of this migration to
// keep the diff scoped.

export const BASES = [
  { id: 'ramstein', name: 'Ramstein AB' },
  { id: 'stuttgart', name: 'USAG Stuttgart' },
  { id: 'kaiserslautern', name: 'KMC Area' },
  { id: 'wiesbaden', name: 'USAG Wiesbaden' },
  { id: 'grafenwoehr', name: 'USAG Bavaria' },
  { id: 'spangdahlem', name: 'Spangdahlem AB' },
] as const;

export function getBaseName(id: string): string {
  return BASES.find((b) => b.id === id)?.name ?? id;
}