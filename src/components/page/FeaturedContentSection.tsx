// src/components/page/FeaturedContentSection.tsx
//
// Ported from FeaturedContentSection.tsx + featuredContentService.ts.
// Reads the selected base from the shared nanostore ($selectedBase in
// stores/baseStore.ts) instead of the dead contexts/BaseContext.tsx —
// same pattern as every other re-enabled homepage section.
//
// The first pass at this file only replicated the base-matching logic
// and missed two filtering steps the real getFeaturedContent() does:
// excluding items outside their start_date/end_date window, and capping
// the result to 4 items. That caused every active row (8, in
// production) to render instead of the intended 4 — fixed below by
// porting the service's full three-stage filter (base match → date
// window → slice(0, 4)) verbatim rather than trying to express it as a
// single Supabase query.

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $selectedBase } from '../../stores/baseStore';
import { supabase } from '../../services/supabaseClient';
import type { FeaturedContent } from '../../types/featuredContent';
import { ExternalLink, Calendar } from 'lucide-react';

async function getFeaturedContent(baseId: string): Promise<FeaturedContent[]> {
  const { data, error } = await supabase
    .from('featured_content')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured content:', error);
    return [];
  }
  if (!data) return [];

  // Base match: 'all' in bases_served always matches; otherwise match the
  // selected base, or show everything if the selected base is itself 'all'.
  const baseFiltered = data.filter((item: FeaturedContent) => {
    let basesArray: string[] = [];
    if (Array.isArray(item.bases_served)) {
      basesArray = item.bases_served;
    } else if (typeof item.bases_served === 'string') {
      try {
        basesArray = JSON.parse(item.bases_served);
      } catch {
        basesArray = [item.bases_served];
      }
    }

    if (basesArray.includes('all')) return true;
    if (baseId !== 'all' && basesArray.includes(baseId)) return true;
    if (baseId === 'all') return true;
    return false;
  });

  // Date window: exclude anything not yet started or already ended.
  const now = new Date();
  const currentItems = baseFiltered.filter((item: FeaturedContent) => {
    const startDate = item.start_date ? new Date(item.start_date) : null;
    const endDate = item.end_date ? new Date(item.end_date) : null;
    if (startDate && startDate > now) return false;
    if (endDate && endDate < now) return false;
    return true;
  });

  return currentItems.slice(0, 4);
}

export default function FeaturedContentSection() {
  const selectedBase = useStore($selectedBase);
  const [featuredItems, setFeaturedItems] = useState<FeaturedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await getFeaturedContent(selectedBase);
      setFeaturedItems(items);
      setLoading(false);
    }
    load();
  }, [selectedBase]);

  if (!loading && featuredItems.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-[var(--brand-bg)] to-[var(--brand-bg-alt)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--brand-dark)] mb-4">
            ✨ Featured This Week
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Don't miss these timely recommendations and special content curated for you
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-5 ${
              featuredItems.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : featuredItems.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : featuredItems.length === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {featuredItems.map((item) => (
              <a
                key={item.id}
                href={item.link_url || '#'}
                target={item.link_url?.startsWith('http') ? '_blank' : '_self'}
                rel={item.link_url?.startsWith('http') ? 'noopener noreferrer' : ''}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[var(--border)] hover:border-[var(--brand-primary)] transform hover:-translate-y-1 flex flex-col"
              >
                {item.image_url ? (
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-dark)] flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-dark)] flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-12 h-12 text-[var(--brand-light)] opacity-50" />
                  </div>
                )}

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.type && (
                      <span className="px-2 py-0.5 bg-[var(--muted)] rounded text-xs capitalize text-[var(--muted-foreground)]">
                        {item.type}
                      </span>
                    )}
                    {item.is_sponsored && item.sponsor_name && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                        Sponsored · {item.sponsor_name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[var(--brand-dark)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[var(--muted-foreground)] text-sm mb-3 line-clamp-3 flex-grow">
                    {item.description}
                  </p>

                  {(item.start_date || item.end_date) && (
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-3">
                      <Calendar size={12} className="text-[var(--brand-primary)]" />
                      <span>
                        {item.start_date &&
                          new Date(item.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        {item.start_date && item.end_date && ' – '}
                        {item.end_date &&
                          new Date(item.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
                    <span className="text-[var(--brand-primary)] font-semibold text-sm group-hover:text-[var(--brand-dark)] transition-colors">
                      {item.cta_text || 'Learn More'}
                    </span>
                    <ExternalLink
                      size={15}
                      className="text-[var(--brand-primary)] group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
