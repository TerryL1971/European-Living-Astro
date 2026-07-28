// src/utils/webVitals.ts
// Core Web Vitals monitoring for SEO and performance tracking
//
// Ported unchanged — no react-router-dom dependency, and it already
// gracefully no-ops if window.Sentry isn't defined (which it currently
// isn't, since Sentry itself is still pending), so nothing needed
// adjusting to run correctly in Astro. Called once per real page load
// (see the <script> in BaseLayout.astro), which is actually a MORE
// natural fit here than in the original SPA — Web Vitals are meant to
// measure a real page load, and Astro gives a fresh one every time.

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

const sendToAnalytics = (metric: Metric) => {
  if (import.meta.env.DEV) {
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
    return;
  }

  if (typeof window.gtag === 'undefined') {
    return;
  }

  window.gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
    metric_rating: metric.rating,
  });
};

const sendToSentry = (metric: Metric) => {
  if (import.meta.env.DEV) {
    return;
  }

  if (typeof window.Sentry === 'undefined') {
    return;
  }

  window.Sentry?.getCurrentScope().setMeasurement(
    metric.name,
    metric.value,
    metric.name === 'CLS' ? 'ratio' : 'millisecond'
  );
};

const reportMetric = (metric: Metric) => {
  sendToAnalytics(metric);
  sendToSentry(metric);
};

/**
 * Initialize Web Vitals monitoring
 */
export const initWebVitals = () => {
  onCLS(reportMetric);
  onINP(reportMetric);
  onFCP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);

  console.log('[Web Vitals] Performance monitoring initialized');
};

declare global {
  interface Window {
    Sentry?: {
      getCurrentScope: () => {
        setMeasurement: (name: string, value: number, unit: string) => void;
      };
    };
  }
}
