// src/components/page/TravelPhrasesSection.tsx
//
// Direct port from the database-driven version. One bug fixed along the
// way: the original only put id="german-phrases" on the LOADING-state
// render, not on the final loaded-state render — meaning the anchor
// Header.tsx's nav link scrolls to would vanish from the page the
// moment phrases finished loading (client-side fetch completing removes
// the element with that id and replaces it with one that has no id at
// all). Added id="german-phrases" to the real content render too so the
// anchor persists regardless of loading state.
//
// No react-router or SEO component dependency here, so no other
// structural changes were needed — this is a client:visible island
// since it sits below the fold and does its own data fetching on mount.

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { phraseService, languages, type Category, type GroupedPhrase } from '../../services/phraseService';

export default function TravelPhrasesSection() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].code);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [phrases, setPhrases] = useState<GroupedPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadPhrases(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await phraseService.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(`Failed to load categories: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPhrases = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await phraseService.getPhrasesByCategory(categoryId);
      setPhrases(data);
      setError(null);
    } catch (err) {
      console.error('Error loading phrases:', err);
      setError(`Failed to load phrases: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      if (selectedCategory) {
        loadPhrases(selectedCategory);
      }
      return;
    }

    try {
      setLoading(true);
      const results = await phraseService.searchPhrases(searchQuery, selectedLanguage);
      setPhrases(results);
      setError(null);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string, languageCode: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      const langMap: { [key: string]: string } = {
        de: 'de-DE',
        fr: 'fr-FR',
        it: 'it-IT',
        es: 'es-ES',
        nl: 'nl-NL',
        cs: 'cs-CZ',
      };

      utterance.lang = langMap[languageCode] || languageCode;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const selectedLang = languages.find((l) => l.code === selectedLanguage);

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
              <Button onClick={loadCategories} className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-light)]">
                Retry Loading
              </Button>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="german-phrases" className="py-16 bg-[var(--brand-bg-alt)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[var(--brand-text)]">Essential Travel Phrases</h2>
          <p className="text-xl text-[var(--brand-text-muted)] max-w-2xl mx-auto">
            Master key phrases in multiple European languages for your travels
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8 px-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className="px-3 sm:px-5 py-2 rounded-full font-medium transition-all hover:opacity-90 text-sm sm:text-base border-2"
              style={{
                background: selectedLanguage === lang.code ? 'var(--brand-primary)' : 'var(--brand-bg-card)',
                color: selectedLanguage === lang.code ? 'white' : 'var(--brand-text)',
                borderColor: selectedLanguage === lang.code ? 'var(--brand-primary)' : 'var(--brand-border)',
              }}
            >
              <span className="mr-1 sm:mr-2 text-base sm:text-lg">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mb-8 px-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none text-base bg-[var(--brand-bg-card)]"
              style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-text)' }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 bg-[var(--brand-primary)] text-white"
              >
                Search
              </button>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    if (selectedCategory) loadPhrases(selectedCategory);
                  }}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-lg font-semibold transition-all hover:opacity-90 bg-[var(--brand-bg-card)] text-[var(--brand-text)] border border-[var(--brand-border)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8 px-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchQuery('');
              }}
              className="px-3 sm:px-5 py-2 rounded-full font-medium transition-all hover:opacity-90 text-sm sm:text-base whitespace-nowrap border-2"
              style={{
                background: selectedCategory === category.id ? 'var(--brand-primary)' : 'var(--brand-bg-card)',
                color: selectedCategory === category.id ? 'white' : 'var(--brand-text)',
                borderColor: selectedCategory === category.id ? 'var(--brand-primary)' : 'var(--brand-border)',
              }}
            >
              <span className="mr-1 sm:mr-2">{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"
              style={{ borderColor: 'var(--brand-primary)', borderRightColor: 'transparent' }}
            ></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-2">
            {phrases.length === 0 ? (
              <Card className="p-8 text-center bg-[var(--brand-bg-card)] border border-[var(--brand-border)]">
                <p className="text-[var(--brand-text-muted)]">
                  {searchQuery ? 'No phrases found matching your search.' : 'No phrases available for this category.'}
                </p>
              </Card>
            ) : (
              <div
                className="overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2"
                style={{ maxHeight: '400px', scrollbarWidth: 'thin', scrollbarColor: 'var(--brand-primary) var(--brand-bg-alt)' }}
              >
                {phrases.map((phrase, idx) => {
                  const translation = phrase.translations[selectedLanguage];

                  if (!translation) return null;

                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-6 rounded-xl transition-shadow hover:shadow-lg bg-[var(--brand-bg-card)] border border-[var(--brand-border)]"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 w-full sm:hidden">
                          {phrase.icon && <span className="text-2xl flex-shrink-0">{phrase.icon}</span>}
                          <div className="flex-1 space-y-3">
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
                          <button
                            onClick={() => speak(translation.text, selectedLanguage)}
                            className="shrink-0 w-10 h-10 rounded-lg transition-all hover:opacity-90 flex items-center justify-center bg-[var(--brand-secondary)] text-[var(--brand-text)]"
                            title="Listen to pronunciation"
                          >
                            <span className="text-lg">🔊</span>
                          </button>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 w-full">
                          {phrase.icon && <span className="text-3xl flex-shrink-0">{phrase.icon}</span>}

                          <div className="flex-1 grid grid-cols-2 gap-6">
                            <div className="flex flex-col justify-center">
                              <p className="text-lg font-semibold text-[var(--brand-text)]">{phrase.english}</p>
                              <p className="text-sm text-[var(--brand-text-muted)] mt-1">English</p>
                            </div>

                            <div className="flex flex-col justify-center pl-4" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
                              <p className="text-xl font-bold mb-1 text-[var(--brand-primary)]">{translation.text}</p>
                              <p className="text-sm text-[var(--brand-text-muted)] italic">{translation.pronunciation}</p>
                              <p className="text-xs text-[var(--brand-text-muted)] mt-1">{selectedLang?.name}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => speak(translation.text, selectedLanguage)}
                            className="shrink-0 w-12 h-12 rounded-lg transition-all hover:opacity-90 flex items-center justify-center bg-[var(--brand-secondary)] text-[var(--brand-text)]"
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
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-[var(--brand-text-muted)]">
            💡 Tip: Click the speaker icon to hear the native pronunciation
          </p>
        </div>
      </div>
    </section>
  );
}
