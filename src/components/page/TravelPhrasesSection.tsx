// src/components/page/TravelPhrasesSection.tsx
//
// Client:visible island (below the fold, fetches its own data on mount).
//
// id="german-phrases" is on every render state — Header.tsx's nav anchor
// targets it.
//
// 2026-08-29: small-screen redesign + Danish/Polish —
//   - Loads every phrase once on mount (getAllPhrases; ~2k rows) instead
//     of a fetch per category, so category switching, search, favourites
//     and per-language availability are all derived client-side.
//   - Language + category pickers are native <select>s under sm: (8
//     languages + 14 categories was ~7 rows of chips on a phone);
//     desktop keeps the chip walls.
//   - Danish + Polish are translated category-by-category (6 of 14 done):
//     the category picker only offers categories that exist in the
//     chosen language, and switching language snaps to an available one.
//   - ♥ favourites: tap the heart to save a phrase (localStorage, keyed
//     by the English text so it follows whatever language you view).
//     "♥ Saved" acts as a category; Copy / Print make an offline list.

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  phraseService,
  languages,
  speechLangMap,
  type Category,
  type GroupedPhrase,
} from '../../services/phraseService';

const FAV_KEY = 'el:phrase-favorites';
const FAV_VIEW = '__favorites__';
const HEART = '#e0245e';

function readFavorites(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default function TravelPhrasesSection() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].code);
  const [selectedCategory, setSelectedCategory] = useState<string>(FAV_VIEW);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allByCat, setAllByCat] = useState<Record<string, GroupedPhrase[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_KEY) setFavorites(readFavorites());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [cats, all] = await Promise.all([
        phraseService.getCategories(),
        phraseService.getAllPhrases(),
      ]);
      setCategories(cats);
      setAllByCat(all);
      setSelectedCategory((cur) => (cur === FAV_VIEW && cats[0] ? cats[0].id : cur));
      setError(null);
    } catch (err) {
      console.error('Error loading phrases:', err);
      setError(`Failed to load phrases: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedLang = languages.find((l) => l.code === selectedLanguage);

  // Categories that have at least one phrase in the chosen language.
  const availableCategories = useMemo(
    () =>
      categories.filter((c) =>
        (allByCat[c.id] || []).some((p) => p.translations[selectedLanguage]),
      ),
    [categories, allByCat, selectedLanguage],
  );

  const unavailableCount = categories.length - availableCategories.length;

  // How many categories each language covers — drives the "6/14" hint
  // shown right on the language picker.
  const coverageByLang = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lang of languages) {
      map[lang.code] = categories.filter((c) =>
        (allByCat[c.id] || []).some((p) => p.translations[lang.code]),
      ).length;
    }
    return map;
  }, [categories, allByCat]);

  const langLabel = (code: string, name: string) => {
    const ready = coverageByLang[code] ?? 0;
    const total = categories.length;
    return ready > 0 && ready < total ? `${name} · ${ready}/${total}` : name;
  };

  // If the current category has nothing in the new language, snap to one
  // that does (keeps Danish/Polish from landing on an empty list).
  useEffect(() => {
    if (loading || selectedCategory === FAV_VIEW) return;
    if (!availableCategories.some((c) => c.id === selectedCategory) && availableCategories[0]) {
      setSelectedCategory(availableCategories[0].id);
    }
  }, [selectedLanguage, availableCategories, loading]);

  const favoritePhrases = useMemo(() => {
    if (favorites.length === 0) return [];
    const set = new Set(favorites);
    const seen = new Set<string>();
    return Object.values(allByCat)
      .flat()
      .filter((p) => set.has(p.english) && !seen.has(p.english) && (seen.add(p.english), true))
      .sort((a, b) => favorites.indexOf(a.english) - favorites.indexOf(b.english));
  }, [allByCat, favorites]);

  const searchResults = useMemo(() => {
    const q = activeSearch.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set<string>();
    return Object.values(allByCat)
      .flat()
      .filter((p) => {
        if (seen.has(p.english)) return false;
        const t = p.translations[selectedLanguage];
        const hit =
          p.english.toLowerCase().includes(q) ||
          (t && (t.text.toLowerCase().includes(q) || t.pronunciation.toLowerCase().includes(q)));
        if (hit) seen.add(p.english);
        return hit;
      });
  }, [allByCat, activeSearch, selectedLanguage]);

  const inFavView = selectedCategory === FAV_VIEW && !activeSearch;
  const inSearch = !!activeSearch;

  const shown = inSearch
    ? searchResults
    : inFavView
      ? favoritePhrases
      : allByCat[selectedCategory] || [];

  const speak = (text: string, code: string) => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechLangMap[code] || code;
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const toggleFavorite = (english: string) => {
    setFavorites((prev) => {
      const next = prev.includes(english)
        ? prev.filter((e) => e !== english)
        : [...prev, english];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* storage blocked */
      }
      return next;
    });
  };

  const runSearch = () => setActiveSearch(searchQuery);
  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  const favoritesAsText = () =>
    `My travel phrases — ${selectedLang?.name}\n\n` +
    favoritePhrases
      .map((p) => {
        const t = p.translations[selectedLanguage];
        return `${p.english}\n  ${t ? t.text : '(not translated yet)'}${
          t?.pronunciation ? `  [${t.pronunciation}]` : ''
        }`;
      })
      .join('\n\n');

  const copyFavorites = async () => {
    try {
      await navigator.clipboard.writeText(favoritesAsText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const printFavorites = () => {
    const rows = favoritePhrases
      .map((p) => {
        const t = p.translations[selectedLanguage];
        return `<tr><td>${p.english}</td><td><b>${t ? t.text : '—'}</b>${
          t?.pronunciation ? `<br><i>${t.pronunciation}</i>` : ''
        }</td></tr>`;
      })
      .join('');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<!doctype html><meta charset="utf-8"><title>My Travel Phrases</title>` +
        `<style>body{font:16px/1.5 -apple-system,system-ui,sans-serif;margin:2rem;color:#1f2937}` +
        `h1{font-size:1.25rem}table{border-collapse:collapse;width:100%}` +
        `td{border-bottom:1px solid #e5e7eb;padding:.6rem .4rem;vertical-align:top}` +
        `td:first-child{width:45%;color:#475569}i{color:#64748b;font-weight:400}</style>` +
        `<h1>My Travel Phrases &mdash; ${selectedLang?.name}</h1><table>${rows}</table>` +
        `<script>window.onload=function(){print()}<\/script>`,
    );
    w.document.close();
  };

  if (loading && categories.length === 0) {
    return (
      <section id="german-phrases" className="py-16 bg-[var(--brand-bg-alt)]">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"
              style={{ borderColor: 'var(--brand-primary)', borderRightColor: 'transparent' }}
            ></div>
            <p className="mt-4 text-[var(--brand-text-muted)]">Loading phrases...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="german-phrases" className="py-16 bg-[var(--brand-bg-alt)]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-[var(--brand-bg-card)] border border-[var(--brand-border)]">
              <h3 className="text-xl font-bold mb-4 text-[var(--brand-text)]">Error Loading Phrases</h3>
              <p className="mb-4 text-[var(--brand-text-muted)]">{error}</p>
              <Button
                onClick={load}
                className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-light)]"
              >
                Retry Loading
              </Button>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const fieldStyle = {
    borderColor: 'var(--brand-border)',
    color: 'var(--brand-text)',
    background: 'var(--brand-bg-card)',
  };

  return (
    <section id="german-phrases" className="py-16 bg-[var(--brand-bg-alt)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 text-[var(--brand-text)]">Essential Travel Phrases</h2>
          <p className="text-xl text-[var(--brand-text-muted)] max-w-2xl mx-auto">
            Master key phrases in multiple European languages for your travels
          </p>
        </div>

        {/* ── Language ─────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-4 px-2 sm:hidden">
          <label className="block text-sm font-medium mb-1 text-[var(--brand-text-muted)]">Language</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none"
            style={fieldStyle}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {langLabel(lang.code, lang.name)}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:flex flex-wrap justify-center items-center gap-2 mb-8 px-2">
          {languages.map((lang) => {
            const ready = coverageByLang[lang.code] ?? 0;
            const partial = ready > 0 && ready < categories.length;
            const active = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                title={partial ? `${ready} of ${categories.length} categories translated so far` : undefined}
                className="px-5 py-2 rounded-full font-medium transition-all hover:opacity-90 text-base border-2"
                style={{
                  background: active ? 'var(--brand-primary)' : 'var(--brand-bg-card)',
                  color: active ? 'white' : 'var(--brand-text)',
                  borderColor: active ? 'var(--brand-primary)' : 'var(--brand-border)',
                }}
              >
                <span className="mr-2 text-lg">{lang.flag}</span>
                {lang.name}
                {partial && (
                  <span
                    className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full align-middle"
                    style={{
                      background: active ? 'rgba(255,255,255,0.25)' : 'var(--brand-bg-alt)',
                      color: active ? 'white' : 'var(--brand-text-muted)',
                    }}
                  >
                    {ready}/{categories.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Search ──────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-4 px-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none text-base"
              style={fieldStyle}
            />
            <div className="flex gap-2">
              <button
                onClick={runSearch}
                className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 bg-[var(--brand-primary)] text-white"
              >
                Search
              </button>
              {(searchQuery || activeSearch) && (
                <button
                  onClick={clearSearch}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-lg font-semibold transition-all hover:opacity-90 bg-[var(--brand-bg-card)] text-[var(--brand-text)] border border-[var(--brand-border)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Category ────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-6 px-2 sm:hidden">
          <label className="block text-sm font-medium mb-1 text-[var(--brand-text-muted)]">Category</label>
          <select
            value={inFavView ? FAV_VIEW : selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              clearSearch();
            }}
            className="w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none"
            style={fieldStyle}
          >
            <option value={FAV_VIEW}>♥ Saved{favorites.length ? ` (${favorites.length})` : ''}</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:flex flex-wrap justify-center gap-2 mb-6 px-2">
          <button
            onClick={() => {
              setSelectedCategory(FAV_VIEW);
              clearSearch();
            }}
            className="px-5 py-2 rounded-full font-medium transition-all hover:opacity-90 text-base whitespace-nowrap border-2"
            style={{
              background: inFavView ? HEART : 'var(--brand-bg-card)',
              color: inFavView ? 'white' : 'var(--brand-text)',
              borderColor: inFavView ? HEART : 'var(--brand-border)',
            }}
          >
            <span className="mr-2">♥</span>Saved{favorites.length ? ` (${favorites.length})` : ''}
          </button>
          {availableCategories.map((category) => {
            const active = !inFavView && !inSearch && selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  clearSearch();
                }}
                className="px-5 py-2 rounded-full font-medium transition-all hover:opacity-90 text-base whitespace-nowrap border-2"
                style={{
                  background: active ? 'var(--brand-primary)' : 'var(--brand-bg-card)',
                  color: active ? 'white' : 'var(--brand-text)',
                  borderColor: active ? 'var(--brand-primary)' : 'var(--brand-border)',
                }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            );
          })}
        </div>

        {/* ── Language coverage note ──────────────────────────────── */}
        {unavailableCount > 0 && (
          <p className="max-w-4xl mx-auto px-2 mb-4 text-sm text-[var(--brand-text-muted)] text-center sm:text-left">
            ℹ️ {selectedLang?.name} is still a work in progress — {availableCategories.length} of{' '}
            {categories.length} categories are translated; the rest are hidden from the list above until they're ready.
          </p>
        )}

        {/* ── Favourites toolbar ──────────────────────────────────── */}
        {inFavView && favoritePhrases.length > 0 && (
          <div className="max-w-4xl mx-auto px-2 mb-4 flex flex-wrap items-center gap-2">
            <span className="mr-auto text-sm text-[var(--brand-text-muted)]">
              {favoritePhrases.length} saved phrase{favoritePhrases.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={copyFavorites}
              className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:opacity-90 bg-[var(--brand-bg-card)] text-[var(--brand-text)]"
              style={{ borderColor: 'var(--brand-border)' }}
            >
              {copied ? 'Copied ✓' : 'Copy list'}
            </button>
            <button
              onClick={printFavorites}
              className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:opacity-90 bg-[var(--brand-bg-card)] text-[var(--brand-text)]"
              style={{ borderColor: 'var(--brand-border)' }}
            >
              Print / save
            </button>
          </div>
        )}

        {/* ── Phrase list ─────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-2">
          {shown.length === 0 ? (
            <Card className="p-8 text-center bg-[var(--brand-bg-card)] border border-[var(--brand-border)]">
              <p className="text-[var(--brand-text-muted)]">
                {inSearch
                  ? 'No phrases found matching your search.'
                  : inFavView
                    ? 'No saved phrases yet. Tap the ♡ on any phrase to build a list for your trip.'
                    : 'No phrases available for this category.'}
              </p>
            </Card>
          ) : (
            <div
              className="overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2"
              style={{
                maxHeight: '460px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--brand-primary) var(--brand-bg-alt)',
              }}
            >
              {shown.map((phrase, idx) => {
                const translation = phrase.translations[selectedLanguage];
                if (!translation) return null;
                const isFav = favorites.includes(phrase.english);

                const heart = (size: string) => (
                  <button
                    onClick={() => toggleFavorite(phrase.english)}
                    title={isFav ? 'Remove from saved' : 'Save for your trip'}
                    aria-pressed={isFav}
                    className={`shrink-0 ${size} rounded-lg border flex items-center justify-center transition-colors`}
                    style={{
                      borderColor: isFav ? HEART : 'var(--brand-border)',
                      background: isFav ? '#fde7ee' : 'var(--brand-bg-card)',
                      color: isFav ? HEART : 'var(--brand-text-muted)',
                    }}
                  >
                    <span className="text-lg leading-none">{isFav ? '♥' : '♡'}</span>
                  </button>
                );

                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-6 rounded-xl transition-shadow hover:shadow-lg bg-[var(--brand-bg-card)] border border-[var(--brand-border)]"
                  >
                    {/* mobile */}
                    <div className="flex items-start gap-3 w-full sm:hidden">
                      {phrase.icon && <span className="text-2xl flex-shrink-0">{phrase.icon}</span>}
                      <div className="flex-1 space-y-3 min-w-0">
                        <div>
                          <p className="text-base font-semibold text-[var(--brand-text)]">{phrase.english}</p>
                          <p className="text-xs text-[var(--brand-text-muted)]">English</p>
                        </div>
                        <div className="pt-3 border-t-2" style={{ borderColor: 'var(--brand-primary)' }}>
                          <p className="text-lg font-bold mb-1 text-[var(--brand-primary)]">{translation.text}</p>
                          <p className="text-sm text-[var(--brand-text-muted)] italic">{translation.pronunciation}</p>
                          <p className="text-xs text-[var(--brand-text-muted)] mt-1">{selectedLang?.name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {heart('w-10 h-10')}
                        <button
                          onClick={() => speak(translation.text, selectedLanguage)}
                          className="shrink-0 w-10 h-10 rounded-lg transition-all hover:opacity-90 flex items-center justify-center bg-[var(--brand-secondary)] text-[var(--brand-text)]"
                          title="Listen to pronunciation"
                        >
                          <span className="text-lg">🔊</span>
                        </button>
                      </div>
                    </div>

                    {/* desktop */}
                    <div className="hidden sm:flex items-center gap-4 w-full">
                      {phrase.icon && <span className="text-3xl flex-shrink-0">{phrase.icon}</span>}
                      <div className="flex-1 grid grid-cols-2 gap-6">
                        <div className="flex flex-col justify-center">
                          <p className="text-lg font-semibold text-[var(--brand-text)]">{phrase.english}</p>
                          <p className="text-sm text-[var(--brand-text-muted)] mt-1">English</p>
                        </div>
                        <div
                          className="flex flex-col justify-center pl-4"
                          style={{ borderLeft: '4px solid var(--brand-primary)' }}
                        >
                          <p className="text-xl font-bold mb-1 text-[var(--brand-primary)]">{translation.text}</p>
                          <p className="text-sm text-[var(--brand-text-muted)] italic">{translation.pronunciation}</p>
                          <p className="text-xs text-[var(--brand-text-muted)] mt-1">{selectedLang?.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {heart('w-12 h-12')}
                        <button
                          onClick={() => speak(translation.text, selectedLanguage)}
                          className="w-12 h-12 rounded-lg transition-all hover:opacity-90 flex items-center justify-center bg-[var(--brand-secondary)] text-[var(--brand-text)]"
                          title="Listen to pronunciation"
                        >
                          <span className="text-xl">🔊</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-[var(--brand-text-muted)]">
            💡 Tip: tap 🔊 to hear it, tap ♡ to save phrases for your trip
          </p>
        </div>
      </div>
    </section>
  );
}
