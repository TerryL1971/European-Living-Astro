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
      // Static routes are auto-included. Dynamic Supabase-driven routes
      // (day-trips/:id, destinations/:id, articles/:slug) are appended by
      // scripts/generate-dynamic-sitemap-entries.ts at build time — see
      // that file and package.json "postbuild" script.
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

  // Prefetches a page's HTML the moment a visitor hovers/focuses its
  // link (default strategy), so by the time they actually click, the
  // <ClientRouter /> transition (see BaseLayout.astro) has little or
  // nothing left to fetch. Pairs with View Transitions to address a
  // measured ~1.2s full-page-reload cost per navigation, down from
  // the old React SPA's ~50ms client-side route swap.
  prefetch: true,
});