// src/utils/sentry.ts
//
// Ported from the original main.tsx's initSentry(). Uses @sentry/browser
// instead of @sentry/react: browserTracingIntegration and
// replayIntegration aren't React-specific (they're browser-level —
// tracing navigation/network, recording DOM sessions), so they work the
// same regardless of whether there's one React root or several separate
// islands like this site has. The deliberate requestIdleCallback
// deferral is preserved exactly, per the original comment's reasoning:
// loading the SDK before first paint delays time-to-interactive
// regardless of the sample rate, since sampling only controls what gets
// SENT to Sentry, not what the browser downloads/parses first.
//
// DSN moved to an env var (PUBLIC_SENTRY_DSN) rather than hardcoded, to
// keep it out of source — same pattern as PUBLIC_GA4_ID.

import * as Sentry from '@sentry/browser';

export function initSentry() {
  const dsn = import.meta.env.PUBLIC_SENTRY_DSN as string | undefined;

  if (!dsn) {
    console.log('[Sentry] PUBLIC_SENTRY_DSN not set, skipping');
    return;
  }

  Sentry.init({
    dsn,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    tracesSampleRate: 0.1,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    environment: import.meta.env.MODE,

    sendDefaultPii: false,

    enabled: import.meta.env.PROD,

    ignoreErrors: ['ResizeObserver loop limit exceeded', 'Non-Error promise rejection captured', 'Network request failed'],
  });
}

/**
 * Defers Sentry init until the browser is idle (or after a short
 * timeout on browsers without requestIdleCallback), so the SDK doesn't
 * compete with the page's own first paint / time-to-interactive.
 * Only runs in production — same as the original.
 */
export function initSentryDeferred() {
  if (!import.meta.env.PROD) return;

  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(initSentry);
  } else {
    setTimeout(initSentry, 1000);
  }
}
