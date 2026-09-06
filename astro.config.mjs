// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.european-living.live',
  integrations: [
    react(),
    sitemap({
      // Every route is prerendered to static HTML at build time — including
      // the Supabase-driven dynamic routes (articles/[slug], businesses/[slug],
      // destinations/[slug], day-trips/[slug]), whose paths come from
      // getStaticPaths(). @astrojs/sitemap walks the built pages, so all of
      // them land in the sitemap automatically; only /admin/ is excluded here.
      filter: (page) => !page.includes('/admin/'),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),

  // Static by default; only admin routes opt into on-demand rendering
  // via `export const prerender = false` in the page itself.
  output: 'static',

  // URLs are canonical WITHOUT a trailing slash (e.g. /articles/frankfurt).
  // Every <link rel="canonical">, internal <a href>, and JSON-LD url is
  // written that way, and Google Search Console had already consolidated
  // the indexed pages onto the no-slash form — but the build defaulted to
  // `directory` format (/articles/frankfurt/index.html) and @astrojs/sitemap
  // followed suit, so the sitemap advertised trailing-slash URLs that every
  // canonical tag then pointed away from. Result: ~98 pages stuck as
  // "Alternative page with proper canonical tag", none indexed from the
  // sitemap. `trailingSlash: 'never'` + `format: 'file'` makes the build
  // output, the sitemap, and the canonical tags all agree; the Vercel
  // adapter adds 308 redirects from the trailing-slash variants.
  trailingSlash: 'never',
  build: {
    format: 'file',
  },

  // Prefetches a page's HTML the moment a visitor hovers/focuses its
  // link (default strategy), so the click itself has little or nothing
  // left to fetch. <ClientRouter /> was removed from BaseLayout on
  // 2026-08-29 (it shipped broken UX on real devices); every route is
  // static HTML and /_astro assets are immutably cached, so a plain
  // full-page navigation only fetches the small gzipped HTML.
  prefetch: true,
});