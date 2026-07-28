// src/contexts/BaseContext.tsx
// Ported unchanged from the current site — no react-router-dom dependency
// here, so nothing about the Astro migration needed to touch this file.
//
// IMPORTANT (Astro-specific): this Context only works within a single
// island's component tree. It does NOT cross the static/island boundary
// — wrapping <BaseProvider> around the whole page in BaseLayout.astro
// would NOT make `useBase()` work inside a totally separate island like
// Header.tsx, because each `client:` directive mounts its own isolated
// React root. Any future island that needs `useBase()` (BaseSelector,
// BusinessList filtered by base, etc.) must import BaseProvider itself
// and wrap its own component tree with it — see BaseSelector.tsx (to be
// ported next) for the pattern.

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface BaseContextType {
  selectedBase: string;
  setSelectedBase: (baseId: string) => void;
  isLoaded: boolean;
}

const BaseContext = createContext<BaseContextType | null>(null);

interface BaseProviderProps {
  children: ReactNode;
}

export function BaseProvider({ children }: BaseProviderProps) {
  const [selectedBase, setSelectedBaseState] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBase = localStorage.getItem('selectedBase');
      if (storedBase) {
        setSelectedBaseState(storedBase);
      }
      setIsLoaded(true);
    }
  }, []);

  const setSelectedBase = (baseId: string) => {
    setSelectedBaseState(baseId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBase', baseId);
    }
  };

  return (
    <BaseContext.Provider value={{ selectedBase, setSelectedBase, isLoaded }}>
      {children}
    </BaseContext.Provider>
  );
}

/**
 * Hook to access base selection context
 * @throws Error if used outside BaseProvider
 */
export function useBase() {
  const context = useContext(BaseContext);
  if (!context) {
    throw new Error('useBase must be used within BaseProvider');
  }
  return context;
}
