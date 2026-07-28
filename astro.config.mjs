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
});