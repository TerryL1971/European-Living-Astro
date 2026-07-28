// src/stores/baseStore.ts

import { atom, onMount } from 'nanostores';

// 1. Initialize with 'all' safely on the server side
export const $selectedBase = atom<string>('all');

// 2. Sync with localStorage safely when the component runs on the client browser
onMount($selectedBase, () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('selectedBase');
    if (stored) {
      $selectedBase.set(stored);
    }
  }
});

// 3. Global update action that updates state in memory and saves to storage
export function updateBase(baseId: string) {
  $selectedBase.set(baseId);
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedBase', baseId);
  }
}