// Single source of truth for site-wide identity facts.
// Structured data (Organization/WebSite schema) and default meta tags
// both pull from here so there's never a mismatch between what the
// <head> says and what the JSON-LD says — inconsistency between the
// two is a common reason AI Overviews / answer engines distrust a site.

export const SITE = {
  name: 'European Living',
  url: 'https://www.european-living.live',
  description:
    'Practical, up-to-date guidance for U.S. military families and American expats living near U.S. bases in Germany — housing allowances, driver\'s licenses, healthcare, schools, and day trips.',
  defaultOgImage: '/og-image.jpg',
  locale: 'en_US',
  facebook: 'https://www.facebook.com/EuropeanLivingOfficial',
  sameAs: ['https://www.facebook.com/EuropeanLivingOfficial'],
  // Used in Organization schema. Update if/when there's a registered
  // business entity behind the site distinct from the operator.
  publisher: {
    name: 'European Living',
    logo: '/icons/icon-512.png', // confirm actual path in public/icons
  },
} as const;

export const BASES = [
  'Stuttgart',
  'Ramstein / KMC',
  'Wiesbaden',
  'Grafenwöhr',
  'Spangdahlem',
] as const;
