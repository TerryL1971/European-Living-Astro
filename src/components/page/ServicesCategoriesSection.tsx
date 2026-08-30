// src/components/page/ServicesCategoriesSection.tsx
//
// FIXED: this component was reading `selectedBase` from the legacy
// BaseContext (via its own isolated <BaseProvider>) — the same
// island-isolation bug already found and fixed in BaseSelector.tsx.
// Each BaseProvider instance is independent, so this component's base
// selection never actually synced with BaseSelectionModal.tsx or
// anything else on the site (which all read/write the shared
// nanostore in stores/baseStore.ts). That's why no base selection
// ever changed these counts, and why the counting behaved
// unpredictably rather than reflecting what was actually selected.
//
// Also removed the old PENDING_BASE_ID / "Services Awaiting Base
// Selection" gate. That gate assumed a pending/unselected state
// distinct from 'all', which made sense under BaseContext's old
// default — but the shared nanostore's default IS 'all', a real,
// meaningful choice (matching "Show All Locations" in the selection
// modal), not a placeholder. Simplest correct behavior: always show
// categories, with counts reflecting whichever base is currently
// selected (combined total across every base when selectedBase is
// 'all').
//
// Other changes from the original, unrelated to this bug:
//   1. useBusinesses() (a react-query hook, not installed/ported here)
//      is replaced with a direct client-side fetch against the same
//      supabaseClient.ts every other island already uses.
//   2. <Link>/useNavigate (react-router) replaced with plain <a> tags.

import { Stethoscope, Scale, Wrench, GraduationCap, Briefcase, Car, Utensils, ShoppingBag, Home, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { supabase } from '../../services/supabaseClient';
import { $selectedBase } from '../../stores/baseStore';

const serviceCategories = [
  { id: 'automotive', title: 'Automotive Services', icon: Car, description: 'Car dealers, mechanics, and auto services that work with Americans' },
  { id: 'healthcare', title: 'Healthcare', icon: Stethoscope, description: 'English-speaking doctors, dentists, veterinarians, and specialists near European US Bases' },
  { id: 'restaurants', title: 'Restaurants & Dining', icon: Utensils, description: 'English-friendly restaurants throughout Europe serving Americans living abroad' },
  { id: 'shopping', title: 'Shopping / Personal Services', icon: ShoppingBag, description: 'Stores, malls, and beauty salons with English-speaking staff' },
  { id: 'home-services', title: 'Home Services', icon: Wrench, description: 'Plumbers, electricians, and handymen who work with American families' },
  { id: 'real-estate', title: 'Real Estate', icon: Home, description: 'Housing agents familiar with American military housing needs' },
  // ids match serviceCategories.ts / the businesses table's actual
  // `category` values — 'legal' -> 'legal-business' and 'business' ->
  // 'hbb' were renamed everywhere else on 2026-07-31 (see
  // data/serviceCategories.ts's comment) but this file's copy of the
  // list was missed. Confirmed against live data: 3 real rows in
  // Supabase have category='hbb', but the stale 'business' id here
  // meant categoryCounts['business'] was always 0, so the homepage
  // permanently showed "Coming Soon" for Business Services regardless
  // of real inventory (and would've done the same for Legal Services
  // the moment a legal-business row existed).
  { id: 'legal-business', title: 'Legal Services', icon: Scale, description: 'Lawyers who understand SOFA status and military regulations' },
  { id: 'education', title: 'Education', icon: GraduationCap, description: 'International schools and tutors for military families' },
  { id: 'hbb', title: 'Business Services', icon: Briefcase, description: 'Tax advisors and accountants familiar with US/German requirements' },
];

export default function ServicesCategoriesSection() {
  const selectedBase = useStore($selectedBase);

  const [businesses, setBusinesses] = useState<{ category: string; bases_served: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from('businesses').select('category, bases_served');
        if (error) {
          console.error('Error fetching business categories:', error);
          setBusinesses([]);
        } else {
          setBusinesses(data ?? []);
        }
      } catch (err) {
        console.error('Error fetching business categories:', err);
        setBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    businesses.forEach((biz) => {
      if (!biz.category) return;
      if (selectedBase !== 'all' && !(biz.bases_served ?? []).includes(selectedBase)) return;
      counts[biz.category] = (counts[biz.category] || 0) + 1;
    });
    return counts;
  }, [businesses, selectedBase]);

  if (isLoading) {
    // id="english-services" has to be here too, not just on the loaded
    // render below — this is a client:visible island that only hydrates
    // once scrolled near the viewport, and this loading state is what
    // Astro actually serves as the initial static HTML. Without the id
    // here, a nav click (or a direct /#english-services link) targeting
    // this section finds nothing, because the id doesn't exist yet until
    // the section has both scrolled into view AND finished its Supabase
    // fetch. Same bug TravelPhrasesSection.tsx already had fixed for
    // id="german-phrases" — this component just never got the same fix.
    return (
      <section id="english-services" className="relative bg-[var(--brand-bg-card)] py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-gold)] mx-auto mb-4" />
          <p className="text-[var(--brand-text)]">Loading trusted services and business counts...</p>
        </div>
      </section>
    );
  }

  const liveCategories = serviceCategories.filter((c) => (categoryCounts[c.id] || 0) > 0);
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <section id="english-services" className="relative bg-[var(--brand-bg-card)] py-20">
      <div className="absolute inset-0 bg-[url('https://pkacbcohrygpyapgtzpq.supabase.co/storage/v1/object/public/images/services.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(12,74,110,0.94) 0%, rgba(12,74,110,0.82) 55%, rgba(12,74,110,0.7) 100%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="uppercase tracking-[0.14em] text-xs font-bold text-white/80 mb-3">The directory</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl mx-auto">
            English-Speaking Services Near Your Base
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            {totalCount > 0 ? `${totalCount} ` : ''}personally checked, English-friendly businesses that
            understand U.S. military and expat families — car dealers, doctors, lawyers, tax advisors, and more.
          </p>

          <div className="mt-6">
            <a
              href="/services-directory"
              className="inline-flex items-center gap-1.5 text-white font-semibold underline underline-offset-4 hover:text-[var(--brand-secondary)] transition-colors"
            >
              Browse the full directory
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {liveCategories.map((category) => {
            const Icon = category.icon;
            const count = categoryCounts[category.id] || 0;

            return (
              <a
                key={category.id}
                href={`/services/${category.id}`}
                className="bg-[var(--brand-bg-card)] rounded-xl p-6 border border-[var(--brand-border)] transition-all block hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-[var(--brand-primary)]/10">
                    <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--brand-text)]">{category.title}</h3>
                    <p className="text-sm text-[var(--brand-text-muted)]">
                      {count} {count === 1 ? 'business' : 'businesses'}
                    </p>
                  </div>
                </div>

                <p className="text-[var(--brand-text-muted)] mb-4 text-sm">{category.description}</p>

                <div className="w-full bg-[var(--brand-primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--brand-primary-dark)] transition font-medium text-center">
                  View {count} {count === 1 ? 'Business' : 'Businesses'}
                </div>
              </a>
            );
          })}
        </div>

        <div className="bg-[var(--brand-primary-dark)] rounded-xl p-8 mb-8 shadow-xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Do You Own a Business Near a US Military Base?</h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              If your business serves American military families and you speak English, we'd love to feature you in
              our directory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/submit-business"
                className="inline-block bg-[var(--brand-secondary)] text-[var(--brand-text)] px-8 py-3 rounded-lg hover:bg-[var(--brand-secondary-light)] transition font-semibold"
              >
                List Your Business
              </a>
              <a
                href="mailto:info@european-living.live?subject=Business Listing Inquiry"
                className="inline-block bg-white text-[var(--brand-text)] px-8 py-3 rounded-lg hover:bg-[var(--brand-bg-alt)] transition font-semibold"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>

        <div className="text-center bg-[var(--brand-bg-card)] rounded-xl p-8 shadow-lg border border-[var(--brand-border)]">
          <h3 className="text-2xl font-bold text-[var(--brand-text)] mb-4">Need More Help Finding Services?</h3>
          <p className="text-[var(--brand-text-muted)] mb-6 max-w-2xl mx-auto">
            Check out our comprehensive guide with tips for finding English-speaking professionals throughout
            Germany.
          </p>
          <a
            href="/articles/services"
            className="inline-block bg-[var(--brand-primary)] text-white px-8 py-3 rounded-lg hover:bg-[var(--brand-primary-light)] transition font-semibold"
          >
            Read Full Services Guide →
          </a>
        </div>
      </div>
    </section>
  );
}