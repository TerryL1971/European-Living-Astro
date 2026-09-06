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

  // Prefetches a page's HTML the moment a visitor hovers/focuses its
  // link (default strategy), so the click itself has little or nothing
  // left to fetch. <ClientRouter /> was removed from BaseLayout on
  // 2026-08-29 (it shipped broken UX on real devices); every route is
  // static HTML and /_astro assets are immutably cached, so a plain
  // full-page navigation only fetches the small gzipped HTML.
  prefetch: true,
});