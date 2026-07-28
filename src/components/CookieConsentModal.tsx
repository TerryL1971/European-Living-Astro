// src/components/CookieConsentModal.tsx
//
// Ported with one fix: the original's "already consented" branch (a
// returning visitor on a fresh page load) only called applyConsent(),
// never initGA(). applyConsent() just calls window.gtag(...), which
// does nothing if gtag was never loaded — meaning returning visitors
// never actually got GA loaded on any visit after their first consent
// choice. Added an initGA() call (guarded by their saved analytics
// preference) to that branch so returning visitors with existing
// analytics consent actually get tracked, on every page load, as
// intended.

import { initGA } from '../utils/analytics';
import React, { useState, useEffect } from 'react';
import { Cookie, Settings, X, Shield, BarChart, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsentModal: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookieConsent');
    const consentDate = localStorage.getItem('cookieConsentDate');

    if (hasConsented && consentDate) {
      const consentAge = Date.now() - new Date(consentDate).getTime();
      const twelveMonths = 365 * 24 * 60 * 60 * 1000;

      if (consentAge > twelveMonths) {
        localStorage.removeItem('cookieConsent');
        localStorage.removeItem('cookieConsentDate');
        setTimeout(() => setShowBanner(true), 500);
      } else {
        try {
          const saved = JSON.parse(hasConsented);
          setPreferences(saved);
          applyConsent(saved);
          // FIX: load GA on this page load too, not just the one where
          // consent was first given — see file header note.
          if (saved.analytics) {
            initGA();
          }
        } catch (e) {
          console.error('Error parsing cookie preferences', e);
        }
      }
    } else {
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    if (typeof window.gtag === 'undefined') {
      console.log('gtag not loaded yet');
      return;
    }

    if (prefs.analytics) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    } else {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }

    if (prefs.marketing) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } else {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    initGA();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    if (preferences.analytics) {
      initGA();
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());

    applyConsent(prefs);

    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }));
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowBanner(true);
      setShowSettings(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !showSettings && handleAcceptAll()}
          />

          <AnimatePresence>
            {showSettings && (
              <motion.div
                className="fixed inset-0 z-[102] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                      <Settings className="w-6 h-6 text-blue-600" />
                      <h3 className="text-2xl font-bold text-gray-900">Cookie Settings</h3>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Close settings"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <p className="text-gray-600">
                      We use cookies to improve your experience on our site. You can choose which types of cookies to
                      allow below.
                    </p>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Necessary Cookies</h4>
                            <p className="text-sm text-gray-600">
                              Required for the website to function. These cannot be disabled.
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>
                      </div>
                      <details className="text-sm text-gray-500 mt-3">
                        <summary className="cursor-pointer hover:text-gray-700 font-medium">What do these do?</summary>
                        <ul className="mt-2 ml-4 space-y-1 list-disc">
                          <li>Enable core website functionality</li>
                          <li>Remember your base selection</li>
                          <li>Secure authentication and session management</li>
                          <li>Accessibility features</li>
                        </ul>
                      </details>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <BarChart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Analytics Cookies</h4>
                            <p className="text-sm text-gray-600">
                              Help us understand how visitors use our site to improve user experience.
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => togglePreference('analytics')}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                              preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                            } px-1`}
                            aria-label={`Toggle analytics cookies ${preferences.analytics ? 'off' : 'on'}`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </button>
                        </div>
                      </div>
                      <details className="text-sm text-gray-500 mt-3">
                        <summary className="cursor-pointer hover:text-gray-700 font-medium">What do these do?</summary>
                        <ul className="mt-2 ml-4 space-y-1 list-disc">
                          <li>Anonymous visitor statistics</li>
                          <li>Page view tracking</li>
                          <li>User journey analysis</li>
                          <li>Help us improve navigation and content</li>
                        </ul>
                        <p className="mt-2 text-xs">We use Google Analytics with IP anonymization.</p>
                      </details>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Marketing Cookies</h4>
                            <p className="text-sm text-gray-600">
                              Used to deliver personalized advertisements based on your interests.
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => togglePreference('marketing')}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                              preferences.marketing ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                            } px-1`}
                            aria-label={`Toggle marketing cookies ${preferences.marketing ? 'off' : 'on'}`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </button>
                        </div>
                      </div>
                      <details className="text-sm text-gray-500 mt-3">
                        <summary className="cursor-pointer hover:text-gray-700 font-medium">What do these do?</summary>
                        <ul className="mt-2 ml-4 space-y-1 list-disc">
                          <li>Track your browsing across websites</li>
                          <li>Deliver relevant advertisements</li>
                          <li>Measure ad campaign effectiveness</li>
                          <li>Create advertising profiles</li>
                        </ul>
                      </details>
                    </div>

                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                      <p>
                        For more information about how we use cookies, please see our{' '}
                        <a href="/privacy-policy" className="text-blue-600 hover:underline font-medium">
                          Privacy Policy
                        </a>
                        . You can change your preferences at any time.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 p-6 flex flex-col sm:flex-row gap-3 flex-shrink-0 bg-white">
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Save Preferences
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Accept All
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showSettings && (
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white border-t-2 border-gray-200 shadow-2xl"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Cookie className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">🍪 Cookie Settings</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        We use cookies to provide you with an optimal website experience. Further information and
                        how you can object to the use of cookies at any time can be found in our{' '}
                        <a
                          href="/privacy-policy"
                          className="text-blue-600 hover:underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          privacy policy
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                      onClick={handleRejectAll}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition whitespace-nowrap"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition whitespace-nowrap"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap shadow-lg"
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentModal;
