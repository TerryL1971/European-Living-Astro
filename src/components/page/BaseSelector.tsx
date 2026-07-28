// src/components/page/BaseSelector.tsx
import { MapPin } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { BASES } from '../../data/bases';
import { $selectedBase, updateBase } from '../../stores/baseStore';

export default function BaseSelector() {
  const selectedBase = useStore($selectedBase);
  const currentBase = BASES.find((b) => b.id === selectedBase);

  const handleBaseChange = (newBase: string) => {
    updateBase(newBase);
    window.dispatchEvent(new CustomEvent('baseChanged', { detail: { baseId: newBase } }));
  };

  return (
    <div className="bg-[var(--brand-primary)] text-white py-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
            <div className="min-w-0">
              <p className="text-xs opacity-80 whitespace-nowrap">Your Base</p>
              <p className="font-semibold truncate">{currentBase?.name || 'Select a base'}</p>
              <p className="text-xs opacity-80 mt-0.5 truncate">
                {currentBase?.location} • Serving {currentBase?.nearbyTowns.join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <label htmlFor="base-select" className="text-sm opacity-80 hidden sm:block">
              Change Base:
            </label>
            <select
              id="base-select"
              value={selectedBase ?? ''}
              onChange={(e) => handleBaseChange(e.target.value)}
              className="bg-white text-[var(--brand-dark)] px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-100 transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] max-w-xs flex-shrink-0"
            >
              {BASES.map((base) => (
                <option key={base.id} value={base.id}>{base.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}