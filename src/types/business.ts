// src/types/business.ts

import type { Database } from './supabase';

/**
 * Unified Business Type System
 * Matches the REAL Supabase schema (generated 2026-07-31 via
 * `npx supabase gen types typescript`) with camelCase frontend naming.
 *
 * A previous version of this file included several fields — city,
 * sofaFamiliar, militaryDiscount, discountPercent, priceRange, rating,
 * reviewCount, images, tags — that do NOT exist in the real
 * `businesses` table. That version was itself inaccurate from the
 * start, not something that broke later. This version is built
 * directly against the generated Database type below, so it can't
 * silently drift from the real schema again.
 */

// ==================== SUPABASE ROW TYPES ====================

type SupabaseBusinessRow = Database['public']['Tables']['businesses']['Row'];
type SupabaseReviewRow = Database['public']['Tables']['reviews']['Row'];

// ==================== CORE TYPES ====================

export type ServiceCategory =
  | 'automotive'
  | 'healthcare'
  | 'restaurants'
  | 'shopping'
  | 'home-services'
  | 'real-estate'
  | 'legal-business'
  | 'education'
  | 'hbb';

export type EnglishFluency = 'fluent' | 'conversational' | 'basic';
export type FeaturedTier = 'free' | 'verified' | 'featured' | 'sponsored';
export type BusinessStatus = 'active' | 'pending' | 'inactive';

// ==================== BUSINESS INTERFACE ====================

export interface Business {
  // Core Info
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string | null;
  description?: string | null;

  // Location
  location: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  basesServed?: string[] | null;
  baseDistance?: string | null;
  googleMapsUrl?: string | null;

  // Contact
  phone?: string | null;
  email?: string | null;
  website?: string | null;

  // Features
  englishFluency?: EnglishFluency | null;

  // Metadata
  verified?: boolean | null;
  featured?: boolean | null;
  featuredTier?: FeaturedTier | null;
  status?: BusinessStatus | null;

  // Media
  imageUrl?: string | null;

  // Administrative
  notes?: string | null;
  isOnBase?: boolean | null;

  // Timestamps
  createdAt?: string | null;
  updatedAt?: string | null;
}

// ==================== REVIEW INTERFACE ====================

export interface Review {
  id: string;
  businessId: string | null;
  authorName: string;
  rating: number | null;
  comment?: string | null;
  createdAt: string | null;
}

// ==================== MAPPER FUNCTIONS ====================

/**
 * Maps Supabase snake_case to frontend camelCase
 */
export function mapSupabaseToBusiness(row: SupabaseBusinessRow): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,

    location: row.location,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    basesServed: row.bases_served,
    baseDistance: row.base_distance,
    googleMapsUrl: row.google_maps_url,

    phone: row.phone,
    email: row.email,
    website: row.website,

    englishFluency: row.english_fluency as Business['englishFluency'],

    verified: row.verified,
    featured: row.featured,
    featuredTier: row.featured_tier as Business['featuredTier'],
    status: row.status as Business['status'],

    imageUrl: row.image_url,

    notes: row.notes,
    isOnBase: row.is_on_base,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps frontend camelCase to Supabase snake_case
 */
export function mapBusinessToSupabase(
  business: Partial<Business>
): Database['public']['Tables']['businesses']['Insert'] {
  return {
    name: business.name ?? '',
    category: business.category ?? '',
    location: business.location ?? '',
    slug: business.slug ?? '',
    subcategory: business.subcategory ?? null,
    description: business.description ?? null,
    address: business.address ?? null,
    phone: business.phone ?? null,
    email: business.email ?? null,
    website: business.website ?? null,
    english_fluency: business.englishFluency ?? null,
    verified: business.verified ?? null,
    featured: business.featured ?? null,
    featured_tier: business.featuredTier ?? null,
    base_distance: business.baseDistance ?? null,
    notes: business.notes ?? null,
    image_url: business.imageUrl ?? null,
    status: business.status ?? null,
    bases_served: business.basesServed ?? null,
    latitude: business.latitude ?? null,
    longitude: business.longitude ?? null,
    google_maps_url: business.googleMapsUrl ?? null,
    is_on_base: business.isOnBase ?? null,
  };
}

/**
 * Maps Supabase review to frontend format
 */
export function mapSupabaseToReview(row: SupabaseReviewRow): Review {
  return {
    id: row.id,
    businessId: row.business_id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

// ==================== SUBCATEGORIES ====================
// General reference list, distinct from the canonical per-category
// structure in data/subcategories.ts (which is what category pages
// actually group businesses by).

export const SERVICE_SUBCATEGORIES: Record<ServiceCategory, string[]> = {
  automotive: [
    'Car Dealerships',
    'Mechanics & Repair',
    'Auto Detailing & Body Shops',
    'Inspection Stations (TÜV)',
    'Car Rental',
    'Auto Parts',
  ],
  healthcare: [
    'General Practitioners',
    'Dentists',
    'Medical Specialists',
    'OB/GYN',
    'Dermatology',
    'Pharmacies',
    'Veterinary Services',
  ],
  restaurants: [
    'American',
    'Italian',
    'Asian',
    'German/Traditional',
    'Fast Food',
    'Pizza',
    'Breakfast/Brunch',
    'Vegetarian/Vegan',
    'Steakhouse',
    'Seafood',
    'Mexican',
    'Mediterranean',
    'Bakery/Café',
  ],
  shopping: [
    'Grocery Stores',
    'American Food Stores',
    'Clothing',
    'Electronics',
    'Home Goods',
    'Furniture',
    'Toys',
    'Sports Equipment',
    'Pet Supplies',
    'Pharmacies',
    'Beauty/Cosmetics',
  ],
  'home-services': [
    'Plumbing',
    'Electrical',
    'HVAC',
    'General Handyman',
    'Painting',
    'Cleaning Services',
    'Landscaping',
    'Moving Services',
    'Appliance Repair',
    'Pest Control',
    'Internet/TV Installation',
  ],
  'real-estate': [
    'Rental Agents',
    'Home Purchase Agents',
    'Property Management',
    'Relocation Services',
    'Furniture Rental',
    'Storage',
  ],
  'legal-business': [
    'Immigration Law',
    'SOFA Status',
    'Family Law',
    'Contract Review',
    'Estate Planning',
    'Notary Services',
    'Traffic Violations',
    'Tax Law',
    'Tax Advisors',
    'Accountants',
    'US Tax Preparation',
    'Business Formation',
    'Translation Services',
    'Insurance Agents',
    'Financial Planning',
    'Consulting',
  ],
  education: [
    'International Schools',
    'DoDEA Schools',
    'Preschools/Kindergartens',
    'English Tutoring',
    'German Language Schools',
    'Music Lessons',
    'Sports Programs',
    'After-School Care',
    'University Programs',
  ],
  hbb: [
    'Baking & Catering',
    'Handmade Crafts',
    'Tutoring & Lessons',
    'Pet Services',
    'Photography',
    'Event Planning',
    'Fitness & Wellness',
    'Home Decor',
    'Jewelry & Accessories',
    'Custom Clothing',
  ],
};

// ==================== HELPER FUNCTIONS ====================

export function getCategoryDisplayName(category: ServiceCategory): string {
  const names: Record<ServiceCategory, string> = {
    automotive: 'Automotive Services',
    healthcare: 'Healthcare',
    restaurants: 'Restaurants & Dining',
    shopping: 'Shopping',
    'home-services': 'Home Services',
    'real-estate': 'Real Estate',
    'legal-business': 'Legal & Business Services',
    education: 'Education',
    hbb: 'Home Based Businesses',
  };
  return names[category] || category;
}

export function servesBase(business: Business, baseId: string): boolean {
  if (!business.basesServed || business.basesServed.length === 0) {
    return true; // If no bases specified, show to everyone
  }
  return business.basesServed.includes(baseId);
}

export function getCategoryIcon(category: ServiceCategory): string {
  const icons: Record<ServiceCategory, string> = {
    automotive: '🚗',
    healthcare: '⚕️',
    restaurants: '🍽️',
    shopping: '🛍️',
    'home-services': '🔧',
    'real-estate': '🏠',
    'legal-business': '⚖️',
    education: '🎓',
    hbb: '🏡',
  };
  return icons[category] || '📍';
}