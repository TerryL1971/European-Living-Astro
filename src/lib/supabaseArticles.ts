// Build-time data access for static article pages — all three real
// category values (City Guides, PCS Guides, Travel Tips) build at
// /articles/[slug]. There is no separate /destinations/ page anymore:
// confirmed 2026-07-27 that the live site's UI (nav, carousel, related
// articles) only ever links to /articles/<slug>. A /destinations/<slug>
// route exists on the old app too (same table, queried by slug from a
// second page component) but nothing links to it — it's an orphaned
// duplicate, not a second real content type. The Astro version's
// destinations/[slug].astro is now a 301 redirect to /articles/<slug>
// rather than a second page, so we don't create duplicate-content URLs
// going forward.
//
// `content` is Markdown (the old React app rendered it client-side with
// react-markdown + remark-gfm + rehype-raw + rehype-sanitize). Here it's
// rendered ONCE at build time with `marked` + sanitized with
// `sanitize-html` — same visual result, zero JS shipped to the browser
// for something that never needed to be client-rendered in the first
// place.

import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  content: string; // Markdown
  excerpt: string | null;
  author: string | null;
  featured_image_url: string | null;
  destination_name: string | null;
  tags: string[] | null;
  published: boolean | null;
  view_count: number | null;
  reading_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

const ARTICLE_COLUMNS =
  'id, slug, title, subtitle, category, content, excerpt, author, featured_image_url, destination_name, tags, published, view_count, reading_time_minutes, created_at, updated_at';

/**
 * All published articles across all three real categories (City Guides,
 * PCS Guides, Travel Tips) — used by /articles/[slug]. This used to
 * exclude City Guides on the theory they lived at a separate
 * /destinations/[slug] route; confirmed 2026-07-27 that theory was
 * wrong — /destinations/ is a dead, unlinked duplicate on the live
 * site, not a second real destination for this content.
 */
export async function getAllArticles(): Promise<ArticleRow[]> {
  if (!supabase) return SAMPLE_ARTICLES;

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLUMNS)
    .eq('published', true);

  if (error) {
    console.error('Supabase articles fetch failed, falling back to sample data:', error.message);
    return SAMPLE_ARTICLES;
  }
  return data ?? [];
}

/**
 * Published articles where category = 'City Guides' — used by the
 * homepage destinations carousel. Still a useful filtered view even
 * though City Guides also appear in getAllArticles() above; this is
 * just "give me the subset for the carousel," not a separate page route.
 */
export async function getAllDestinationArticles(): Promise<ArticleRow[]> {
  if (!supabase) return SAMPLE_ARTICLES.filter((a) => a.category === 'City Guides');

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLUMNS)
    .eq('published', true)
    .eq('category', 'City Guides');

  if (error) {
    console.error('Supabase destination fetch failed, falling back to sample data:', error.message);
    return SAMPLE_ARTICLES.filter((a) => a.category === 'City Guides');
  }
  return data ?? [];
}

/**
 * Published articles where category = 'PCS Guides' — used by the PCS
 * Guide page's "Deep Dives" grid (DeepDivesGrid.astro). Mirrors
 * getAllDestinationArticles() above: same "filtered subset for one
 * section" role, not a separate page route.
 */
export async function getAllPcsGuideArticles(): Promise<ArticleRow[]> {
  if (!supabase) return SAMPLE_ARTICLES.filter((a) => a.category === 'PCS Guides');

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLUMNS)
    .eq('published', true)
    .eq('category', 'PCS Guides');

  if (error) {
    console.error('Supabase PCS Guides fetch failed, falling back to sample data:', error.message);
    return SAMPLE_ARTICLES.filter((a) => a.category === 'PCS Guides');
  }
  return data ?? [];
}

/**
 * Slugifies heading text into an anchor id. Shared by renderArticleContent()
 * (which assigns these as actual heading ids in the HTML) and
 * extractHeadings() (which needs the SAME slugs to link to them) — these
 * two must never drift apart or ToC links break.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export interface Heading {
  level: 2 | 3;
  text: string;
  slug: string;
}

/**
 * Extracts h2/h3 headings from article Markdown for the Table of
 * Contents (TableOfContents.astro). Runs on the raw Markdown, not the
 * rendered HTML, so it works independently of renderArticleContent() —
 * but uses the same slugify() so the ids line up. Deduplicates repeated
 * heading text (e.g. two "Resources" headings) by appending -2, -3, etc.,
 * matching GitHub's convention.
 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const baseSlug = slugify(text);
    const count = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    headings.push({ level, text, slug });
  }

  return headings;
}

/**
 * Renders Markdown content to sanitized HTML at build time.
 * Mirrors the old client-side stack (remark-gfm tables/strikethrough,
 * rehype-raw for embedded HTML, rehype-sanitize to strip anything unsafe)
 * but runs once during `astro build` instead of on every page load.
 *
 * Headings get id attributes via a custom renderer, using the same
 * slugify() as extractHeadings() above, so ToC links (#some-heading)
 * actually land on the right element.
 */
export function renderArticleContent(markdown: string): string {
  const seen = new Map<string, number>();
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((t) => ('raw' in t ? t.raw : '')).join('');
    const baseSlug = slugify(text);
    const count = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    return `<h${depth} id="${slug}">${text}</h${depth}>`;
  };

  const rawHtml = marked.parse(markdown, { gfm: true, breaks: false, renderer }) as string;
  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'loading'],
      '*': ['id', 'class'],
    },
  });
}

/** First country-like tag, matching the old app's `tags[1]` convention. */
export function extractCountry(tags: string[] | null): string {
  return tags && tags[1] ? tags[1] : '';
}

// Dev/fallback sample only — replace by populating Supabase, don't ship this.
const SAMPLE_ARTICLES: ArticleRow[] = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    slug: 'oha-vs-miha-explained',
    title: "OHA vs. MIHA: What's the Difference for Military Families in Germany",
    subtitle: null,
    category: 'PCS Guides',
    content: `Overseas Housing Allowance (OHA) is the monthly stipend U.S. service members receive to cover off-base rent while stationed overseas. Move-In Housing Allowance (MIHA) is a separate, one-time payment meant to cover upfront costs when signing a new lease.\n\n## Why People Mix Them Up\n\nBoth appear on the same DTS/OHA paperwork, but they serve different purposes...`,
    excerpt:
      'OHA covers your recurring monthly rent overseas. MIHA is a separate one-time payment for move-in costs. Here is how they actually differ.',
    author: 'European Living',
    featured_image_url: null,
    destination_name: null,
    tags: ['oha', 'miha', 'housing', 'germany', 'military'],
    published: true,
    view_count: 2,
    reading_time_minutes: 8,
    created_at: '2026-07-06T10:16:34.000Z',
    updated_at: '2026-07-06T10:16:34.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    slug: 'strasbourg-city-guide',
    title: 'Strasbourg City Guide',
    subtitle: 'A half-French, half-German canal city',
    category: 'City Guides',
    content: `Strasbourg sits right on the France-Germany border, and it shows.\n\n## Getting Around\n\nPark in a P+R outside the center and tram in.`,
    excerpt: 'Strasbourg pairs French cafe culture with Alsatian half-timbered houses along its canal district.',
    author: 'European Living',
    featured_image_url: null,
    destination_name: 'Strasbourg',
    tags: ['Strasbourg', 'France', 'Alsace', 'Christmas Markets'],
    published: true,
    view_count: 25,
    reading_time_minutes: 28,
    created_at: '2025-11-23T16:12:12.784Z',
    updated_at: '2025-11-23T16:12:12.784Z',
  },
];