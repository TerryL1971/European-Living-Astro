// src/components/page/Header.tsx
//
// Ported from the React Router version. Astro islands render real
// static HTML pages, not an SPA, so:
//   - <Link to="/day-trips"> becomes a plain <a href="/day-trips">
//     (a full page navigation — which is correct here, since each page
//     is now pre-rendered static HTML, not a client-side route change)
//   - useNavigate/useLocation are replaced with window.location, since
//     there's no router context to read from
//
// resetBaseSelection now also clears the nanostore and dispatches
// 'baseChanged', so any page listening for that event (e.g. the
// day-trips filter script) updates immediately on Reset, not just
// once a new base is picked in the reopened modal.
//
// UPDATED 2026-08-19: Destinations/Travel Tips/Travel Phrases/English
// Services each got their own real page (/destinations, /travel-tips,
// /travel-phrases, /english-services) — Terry's call, at his request.
// These used to be /#section links into homepage-only sections; now
// they're plain page links like Day Trips/About, same treatment
// Contact Us already got earlier. The sections themselves stay on the
// homepage too for people scrolling through naturally — this only
// changes what the nav points to.

import { useState, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { updateBase } from '../../stores/baseStore';

const NAV_LINKS = [
  { path: '/destinations', label: 'Destinations' },
  { path: '/travel-tips', label: 'Travel Tips' },
  { path: '/travel-phrases', label: 'Travel Phrases' },
  { path: '/english-services', label: 'English Services' },
] as const;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const resetBaseSelection = () => {
    localStorage.removeItem('selectedBase');
    localStorage.removeItem('hasVisitedSite');
    updateBase('all');
    window.dispatchEvent(new CustomEvent('baseChanged', { detail: { baseId: 'all' } }));
    window.dispatchEvent(new CustomEvent('openBaseSelectionModal'));
    setMobileMenuOpen(false);
  };

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--brand-bg-card)]/95 backdrop-blur-md border-b border-[var(--brand-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/EL_Logo.png" alt="European Living" className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-lg text-[var(--brand-primary-dark)] leading-tight">
                  European Living
                </span>
                <span className="text-xs text-[var(--brand-text-muted)]">Your Guide to Europe</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              
              <a
                href="/"
                onClick={handleLogoClick}
                className="px-4 py-2 text-sm font-medium text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)] rounded-lg"
              >
                Home
              </a>

              {NAV_LINKS.slice(0, 1).map((section) => (
                <a
                  key={section.path}
                  href={section.path}
                  className="px-4 py-2 text-sm font-medium text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)] rounded-lg"
                >
                  {section.label}
                </a>
              ))}

              <a href="/day-trips" className="px-4 py-2 text-sm rounded-lg hover:bg-[var(--brand-bg-alt)]">
                Day Trips
              </a>

              <a
                href="/pcs-guide"
                className="px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5 text-[#1B3A5C] hover:bg-[#1B3A5C]/10 transition-colors"
              >
                <span className="text-[#9da586] text-xs">✈</span>
                PCS Guide
              </a>

              {NAV_LINKS.slice(1).map((section) => (
                <a
                  key={section.path}
                  href={section.path}
                  className="px-4 py-2 text-sm rounded-lg hover:bg-[var(--brand-bg-alt)]"
                >
                  {section.label}
                </a>
              ))}

              <a href="/about" className="px-4 py-2 text-sm rounded-lg hover:bg-[var(--brand-bg-alt)]">
                About
              </a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">

              {/* Plain link to the dedicated /contact page — same
                  destination as the footer's Contact Us link. This used
                  to point to /#contact (the homepage's embedded contact
                  section), which meant the nav and footer Contact Us
                  buttons landed on two different URLs/pages. */}
              <a
                href="/contact"
                className="px-6 py-2.5 bg-[var(--brand-primary)] text-white text-sm font-semibold rounded-full hover:scale-105 transition whitespace-nowrap"
              >
                Contact Us
              </a>
              <button
                onClick={resetBaseSelection}
                className="text-sm text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] hover:underline whitespace-nowrap transition-colors"
              >
                Change base
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--brand-bg-alt)] transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            role="button"
            tabIndex={-1}
            aria-label="Close menu"
          />

          <nav className="absolute top-16 left-0 right-0 bg-white border-b border-[var(--brand-border)] shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              
              <a
                href="/"
                onClick={handleLogoClick}
                className="block w-full text-left px-4 py-3 text-base font-medium text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition"
              >
                Home
              </a>

              {NAV_LINKS.slice(0, 1).map((section) => (
                <a
                  key={section.path}
                  href={section.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition"
                >
                  {section.label}
                </a>
              ))}

              <a
                href="/day-trips"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition"
              >
                Day Trips
              </a>

              <a
                href="/pcs-guide"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg transition bg-[#1B3A5C]/5 border border-[#1B3A5C]/15"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[#1B3A5C]">✈ PCS Guide to Germany</span>
                  <span className="text-xs bg-[#9da586] text-white px-2 py-0.5 rounded-full font-semibold">
                    USO
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 pl-0">Moving to Germany? Start here.</p>
              </a>

              {NAV_LINKS.slice(1).map((section) => (
                <a
                  key={section.path}
                  href={section.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition"
                >
                  {section.label}
                </a>
              ))}

              <a
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition"
              >
                About
              </a>

              <div className="pt-4 border-t border-[var(--brand-border)] mt-4">

                <a
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-3 bg-[var(--brand-primary)] text-white text-base font-semibold rounded-lg hover:bg-[var(--brand-dark)] transition"
                >
                  Contact Us
                </a>
                <button
                  onClick={resetBaseSelection}
                  className="w-full text-center px-4 py-3 text-sm text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] mt-2"
                >
                  Change base
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}