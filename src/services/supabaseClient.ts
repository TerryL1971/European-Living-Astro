// src/services/supabaseClient.ts
//
// This is the BROWSER client — imported by React islands (like
// BusinessCardWithMap) that need to fetch live data client-side after
// the page loads (e.g. review counts that change more often than a
// rebuild schedule). This is separate from src/lib/supabaseArticles.ts
// and src/lib/supabaseDayTrips.ts, which run at BUILD TIME in Node to
// generate static pages — different execution context, same env vars.
//
// Astro inlines any import.meta.env.PUBLIC_* variable into the client
// bundle at build time, so this works in the browser the same way it
// works in Node.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY not set — client-side Supabase reads will fail.'
  );
}

// createClient() validates the URL's format synchronously and throws if
// it's empty — which would happen at MODULE LOAD time, during Astro's
// server-render pass (even client:load islands get one SSR pass to
// produce pre-hydration HTML). A single missing env var would therefore
// crash the ENTIRE static build, every page, not just the one using this
// client. A syntactically valid placeholder avoids that: real requests
// against it would still fail (correctly, with a normal fetch error) if
// the real env vars are genuinely missing, but the build itself survives.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-not-configured.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
