// JSON-LD builders. Each function returns a plain object matching a
// schema.org type — components stringify it into a <script type="application/ld+json">.
//
// Why these specific types:
// - Organization + WebSite: sitewide identity signals, established once
//   in BaseLayout, present on every page. This is what lets Google (and
//   increasingly, LLM-based answer engines crawling for citable sources)
//   resolve "who publishes this" confidently.
// - Article: standard SEO for content pages; carries dateModified, which
//   both Google and AI Overviews weight for freshness.
// - FAQPage: the single highest-leverage AEO schema type. Content
//   structured as explicit question/answer pairs is what gets lifted
//   directly into AI Overviews, Perplexity answers, and voice results.
//   Only use this where the article genuinely contains distinct Q&A
//   content — don't force it onto narrative content, since mismatched
//   schema (markup promises Q&A, content doesn't deliver it) is a
//   manual-action risk in Google Search Console.
// - BreadcrumbList: helps both crawlers and answer engines understand
//   site hierarchy/topical grouping, which factors into topical authority.
// - TouristAttraction / Place: for day-trip and destination pages, gives
//   geo data a plain Article schema can't carry.

import { SITE } from './siteConfig';

type FaqItem = { question: string; answer: string };
type BreadcrumbItem = { name: string; url: string };

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.publisher.name,
    url: SITE.url,
    logo: `${SITE.url}${SITE.publisher.logo}`,
    sameAs: SITE.sameAs,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  slug: string;
  datePublished: string; // ISO 8601
  dateModified: string; // ISO 8601
  image?: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    image: opts.image ? [opts.image] : [`${SITE.url}${SITE.defaultOgImage}`],
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      '@type': 'Organization',
      name: opts.authorName ?? SITE.publisher.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.url}${SITE.publisher.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE.url}/articles/${opts.slug}`,
    },
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}

export function placeSchema(opts: {
  name: string;
  description: string;
  slug: string;
  path: '/destinations' | '/day-trips';
  image?: string;
  latitude?: number;
  longitude?: number;
  addressLocality?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: opts.name,
    description: opts.description,
    image: opts.image ? [opts.image] : undefined,
    url: `${SITE.url}${opts.path}/${opts.slug}`,
    ...(opts.latitude && opts.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: opts.latitude,
            longitude: opts.longitude,
          },
        }
      : {}),
    ...(opts.addressLocality
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: opts.addressLocality,
            addressCountry: 'DE',
          },
        }
      : {}),
  };
}

export function localBusinessSchema(opts: {
  name: string;
  description?: string;
  telephone?: string;
  image?: string;
  streetAddress?: string;
  latitude?: number;
  longitude?: number;
  slug: string; // business id, used to build the canonical url
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.telephone ? { telephone: opts.telephone } : {}),
    ...(opts.image ? { image: [opts.image] } : {}),
    url: `${SITE.url}/businesses/${opts.slug}`,
    ...(opts.streetAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: opts.streetAddress,
            addressCountry: 'DE',
          },
        }
      : {}),
    ...(opts.latitude && opts.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: opts.latitude,
            longitude: opts.longitude,
          },
        }
      : {}),
  };
}
