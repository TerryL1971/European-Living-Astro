// src/utils/analytics.ts
// Google Analytics 4 helper functions
//
// Two changes from the original:
//   1. GA_MEASUREMENT_ID now reads from PUBLIC_GA4_ID (already set in
//      .env) instead of being hardcoded — same value, just configurable
//      without a code change.
//   2. initGA() now calls trackPageView() itself at the end. The
//      original set send_page_view: false and relied on React Router's
//      route-change effect to manually fire trackPageView on every
//      client-side navigation. Astro does real full-page loads instead
//      of client-side routing, so there's no route-change effect to
//      hook into — without this, no pageview would ever fire at all.
//      Calling it once per initGA() call (which now happens once per
//      real page load) is the correct equivalent here.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA4_ID as string;

/**
 * Initialize Google Analytics
 * Only loads in production and respects user consent
 */
export const initGA = () => {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Skipping GA in development mode');
    return;
  }

  if (!GA_MEASUREMENT_ID) {
    console.log('[Analytics] PUBLIC_GA4_ID not set, skipping');
    return;
  }

  const hasConsented = localStorage.getItem('cookieConsent');
  if (!hasConsented) {
    console.log('[Analytics] User has not consented to analytics');
    return;
  }

  try {
    const consent = JSON.parse(hasConsented);
    if (!consent.analytics) {
      console.log('[Analytics] Analytics not enabled in user preferences');
      return;
    }
  } catch {
    console.log('[Analytics] Invalid consent data');
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    // Already loaded this page — still fire a pageview for this load.
    trackPageView(window.location.pathname);
    return;
  }

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // fired manually via trackPageView below
    anonymize_ip: true,
  });

  console.log('[Analytics] Google Analytics initialized');

  // Astro does real full-page loads (not SPA client-side routing), so
  // there's no route-change effect to fire this from — fire it once
  // here, immediately after setup, for the page that triggered init.
  trackPageView(window.location.pathname);
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (import.meta.env.DEV || typeof window.gtag === 'undefined') {
    console.log('[Analytics] Page view:', path, title);
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
) => {
  if (import.meta.env.DEV || typeof window.gtag === 'undefined') {
    console.log('[Analytics] Event:', eventName, params);
    return;
  }

  window.gtag('event', eventName, params);
};

export const trackBusinessView = (businessName: string, category: string) => {
  trackEvent('view_business', {
    business_name: businessName,
    category: category,
  });
};

export const trackSearch = (searchTerm: string, resultCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    result_count: resultCount,
  });
};

export const trackBaseSelection = (baseName: string) => {
  trackEvent('select_base', {
    base_name: baseName,
  });
};

export const trackOutboundLink = (url: string, label?: string) => {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: label || url,
    value: url,
  });
};

export const trackFormSubmission = (formName: string) => {
  trackEvent('form_submission', {
    form_name: formName,
  });
};
