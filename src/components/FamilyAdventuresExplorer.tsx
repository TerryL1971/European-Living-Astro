// src/components/FamilyAdventuresExplorer.tsx
//
// Client island for the interactive parts of /family-adventures: the
// age-group filter, the Germany base sections, and the country tabs.
// Everything else on the page (hero, "Submit a Resource" CTA) is plain
// static Astro markup — no react-router here, all data is static and
// imported from data/familyAdventures.ts.

import { useState } from 'react';
import {
  GERMANY_RESOURCES,
  COUNTRY_HIGHLIGHTS,
  AGE_LABELS,
  type AgeGroup,
  type Country,
} from '../data/familyAdventures';

export default function FamilyAdventuresExplorer() {
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('all');
  const [selectedCountry, setSelectedCountry] = useState<Country>('uk');

  const filterByAge = (ages: string) => {
    if (selectedAge === 'all') return true;
    return ages === 'all' || ages === selectedAge;
  };

  const countryData = COUNTRY_HIGHLIGHTS[selectedCountry];
  const filteredCountryHighlights = countryData.highlights.filter((h) => filterByAge(h.ages));

  return (
    <>
      {/* Age Filter */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        <p className="w-full text-center text-sm font-semibold text-[var(--muted-foreground)] mb-1">
          Filter by age group:
        </p>
        {(Object.keys(AGE_LABELS) as AgeGroup[]).map((age) => (
          <button
            key={age}
            onClick={() => setSelectedAge(age)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
              selectedAge === age
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
            }`}
          >
            {AGE_LABELS[age]}
          </button>
        ))}
      </div>

      {/* Germany Section */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🇩🇪</span>
          <div>
            <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Germany — Near Your Base</h2>
            <p className="text-[var(--muted-foreground)] text-sm">
              Base-specific family resources and activities
            </p>
          </div>
        </div>

        {GERMANY_RESOURCES.map((baseData) => {
          const filtered = baseData.items.filter((item) => filterByAge(item.ages));
          if (filtered.length === 0) return null;

          return (
            <div key={baseData.base} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{baseData.emoji}</span>
                <h3 className="text-xl font-bold text-[var(--brand-dark)]">{baseData.base}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white rounded-xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.type}
                      </span>
                      <span className="text-xs text-orange-600 font-medium">
                        {AGE_LABELS[item.ages as AgeGroup] ?? 'All Ages'}
                      </span>
                    </div>
                    <h4 className="font-bold text-[var(--brand-dark)] mb-2">{item.name}</h4>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                      {item.description}
                    </p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-500 hover:text-orange-700 font-semibold"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Country Highlights */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--brand-dark)] mb-2">
            🌍 Travel Highlights Across Europe
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Must-see family experiences when you venture beyond Germany
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {(Object.keys(COUNTRY_HIGHLIGHTS) as Country[]).map((country) => {
            const data = COUNTRY_HIGHLIGHTS[country];
            return (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${
                  selectedCountry === country
                    ? 'bg-[var(--brand-dark)] text-white border-[var(--brand-dark)]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {data.emoji} {data.title}
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)] mb-6">
          {countryData.subtitle} — top picks for {AGE_LABELS[selectedAge].toLowerCase()}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCountryHighlights.length > 0 ? (
            filteredCountryHighlights.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.type}
                  </span>
                  <span className="text-xs text-orange-600 font-medium">
                    {AGE_LABELS[item.ages as AgeGroup] ?? 'All Ages'}
                  </span>
                </div>
                <h4 className="font-bold text-[var(--brand-dark)] mb-2">{item.name}</h4>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                  {item.description}
                </p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-500 hover:text-orange-700 font-semibold"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-[var(--muted-foreground)]">
              No highlights for this age group in {countryData.title} yet.
              <br />
              <button
                onClick={() => setSelectedAge('all')}
                className="mt-3 text-orange-500 hover:text-orange-700 font-semibold"
              >
                Show all ages →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
