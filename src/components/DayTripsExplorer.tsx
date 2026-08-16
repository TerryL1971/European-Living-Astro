// src/components/DayTripsExplorer.tsx
//
// Client island for the /day-trips filter/search grid. Receives all
// trips pre-fetched at build time from day-trips/index.astro (via
// getAllDayTrips() in lib/supabaseDayTrips) as a prop, and filters
// them client-side.
//
// Reads the selected base from the shared nanostore ($selectedBase in
// stores/baseStore.ts) — same store BaseSelector.tsx,
// BaseSelectionModal.tsx, and ServicesCategoriesSection.tsx use. Do
// NOT import from contexts/BaseContext.tsx — that file is dead legacy
// code (old React Context, requires a <BaseProvider> wrapper nothing
// in this repo provides).
//
// NOTE: the real day_trips schema (see DayTripRow in
// lib/supabaseDayTrips.ts) has no `tags` column — category info comes
// only from `best_for: string[]`. Don't reintroduce a `.tags` read.
//
// PHASE 2 of the bases_served migration (see migration doc): duplicate
// per-base rows are now merged into one row per destination, and
// base_id/base_name columns are gone — bases_served is the only
// source of base data, for both filtering and display. The old
// name-based dedupe (Phase 1) is removed; it's no longer needed since
// there's only one row per destination.

import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $selectedBase } from '../stores/baseStore';
import { MapPin, Car, Train, X, Star, Bookmark } from 'lucide-react';
import type { DayTripRow } from '../lib/supabaseDayTrips';
import { getBaseName } from '../data/bases';

interface Props {
  trips: DayTripRow[];
}

export default function DayTripsExplorer({ trips }: Props) {
  const selectedBase = useStore($selectedBase);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCost, setSelectedCost] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const baseIdFormatted = useMemo(
    () => selectedBase.toLowerCase().replace(/[^a-z0-9]/g, ''),
    [selectedBase]
  );

  const baseTrips = useMemo((): DayTripRow[] => {
    if (selectedBase === 'all') return trips;
    return trips.filter((trip) => trip.bases_served?.includes(baseIdFormatted));
  }, [selectedBase, baseIdFormatted, trips]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    trips.forEach((trip) => {
      (trip.best_for ?? []).forEach((cat) => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return baseTrips.filter((trip) => {
      const matchesSearch =
        searchTerm === '' ||
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || trip.difficulty === selectedDifficulty;
      const matchesCost = selectedCost === 'all' || trip.cost === selectedCost;
      const matchesCategory =
        selectedCategory === 'all' || (trip.best_for ?? []).includes(selectedCategory);
      return matchesSearch && matchesDifficulty && matchesCost && matchesCategory;
    });
  }, [baseTrips, searchTerm, selectedDifficulty, selectedCost, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('all');
    setSelectedCost('all');
    setSelectedCategory('all');
  };

  const hasActiveFilters =
    searchTerm !== '' || selectedDifficulty !== 'all' || selectedCost !== 'all' || selectedCategory !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-[var(--border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">Search Destinations</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">Budget</label>
            <select
              value={selectedCost}
              onChange={(e) => setSelectedCost(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="all">All Budgets</option>
              <option value="$">$ Budget-Friendly</option>
              <option value="$$">$$ Moderate</option>
              <option value="$$$">$$$ Premium</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--brand-dark)] transition"
          >
            <X size={16} /> Clear all filters
          </button>
        )}
      </div>

      <p className="mb-6 text-[var(--muted-foreground)]">
        Found <strong className="text-[var(--brand-dark)]">{filteredTrips.length}</strong> day trip
        {filteredTrips.length !== 1 ? 's' : ''}
        {selectedBase !== 'all' && baseTrips.length > 0 && ` from ${getBaseName(baseIdFormatted)}`}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => {
          const displayImage = trip.hero_image_url || trip.image_url;
          const displayDescription = trip.short_description || trip.description;

          return (
            <a
              key={trip.id}
              href={`/day-trips/${trip.slug ?? trip.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-[var(--border)] group block"
            >
              <div className="relative">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={`Image of ${trip.name}`}
                    loading="lazy"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-dark)] flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-[var(--brand-white)] opacity-50" />
                  </div>
                )}
                {trip.featured && (
                  <div className="absolute top-3 left-3 bg-[var(--brand-gold)] text-[var(--brand-dark)] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Featured
                  </div>
                )}
                {trip.is_must_see && !trip.featured && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Bookmark size={12} fill="currentColor" /> Must-See
                  </div>
                )}
                {trip.rating && (
                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} fill="#FFD700" color="#FFD700" /> {trip.rating}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[var(--brand-dark)] mb-1 group-hover:text-[var(--brand-primary)] transition">
                  {trip.name}
                </h3>
                {selectedBase === 'all' && (
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">
                    From {(trip.bases_served ?? []).map(getBaseName).join(', ')}
                  </p>
                )}
                <p className="text-[var(--muted-foreground)] text-sm mb-4 line-clamp-3">{displayDescription}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Car size={16} className="text-[var(--brand-primary)]" />
                    <span>{trip.drive_time} drive ({trip.distance})</span>
                  </div>
                  {trip.train_time && (
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <Train size={16} className="text-[var(--brand-amber)]" />
                      <span>{trip.train_time} by train</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--brand-gold)] bg-opacity-20 text-[var(--brand-dark)]">
                    {trip.difficulty}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                    {trip.cost}
                  </span>
                </div>
                {(trip.best_for ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {trip.best_for.slice(0, 3).map((tag, i) => (
                      <span key={`${tag}-${i}`} className="text-xs px-2 py-1 bg-[var(--muted)] text-[var(--muted-foreground)] rounded">
                        {tag}
                      </span>
                    ))}
                    {trip.best_for.length > 3 && (
                      <span className="text-xs px-2 py-1 text-[var(--muted-foreground)]">+{trip.best_for.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>

      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--brand-dark)] mb-2">No day trips found</h3>
          <p className="text-[var(--muted-foreground)] mb-4">Try adjusting your filters or search terms</p>
          <button
            onClick={clearFilters}
            className="text-[var(--brand-primary)] hover:text-[var(--brand-dark)] font-semibold transition"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}