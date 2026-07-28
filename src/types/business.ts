// src/types/business.ts
//
// Reconstructed rather than pasted — the original file wasn't shared,
// but every field name here is already proven consistent across
// BusinessCardWithMap.tsx, BusinessDetailPage.tsx, and businessServices.ts
// (englishFluency, baseDistance, imageUrl, basesServed, featuredTier,
// googleMapsUrl, isOnBase all appear used exactly this way in files you
// pasted), plus the real `businesses`/`reviews` table schema. Worth a
// quick sanity check against your actual file if you still have it
// somewhere, but this should match.

export type ServiceCategory =
  | 'automotive'
  | 'healthcare'
  | 'restaurants'
  | 'shopping'
  | 'home-services'
  | 'real-estate'
  | 'legal'
  | 'education'
  | 'business';

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  englishFluency: 'fluent' | 'conversational' | 'basic' | null;
  verified: boolean;
  featured: boolean;
  featuredTier: 'free' | 'verified' | 'featured' | 'sponsored' | null;
  baseDistance: string | null;
  notes: string | null;
  imageUrl: string | null;
  status: 'active' | 'pending' | 'inactive' | null;
  basesServed: string[];
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  isOnBase: boolean;
}

export interface Review {
  id: string;
  businessId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

/** Raw row shape as it comes back from Supabase (snake_case, matches the real `businesses` table). */
interface BusinessRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  english_fluency: string | null;
  verified: boolean | null;
  featured: boolean | null;
  featured_tier: string | null;
  base_distance: string | null;
  notes: string | null;
  image_url: string | null;
  status: string | null;
  bases_served: string[] | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  is_on_base: boolean | null;
}

interface ReviewRow {
  id: string;
  business_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export function mapSupabaseToBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    location: row.location,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    englishFluency: (row.english_fluency as Business['englishFluency']) ?? null,
    verified: row.verified ?? false,
    featured: row.featured ?? false,
    featuredTier: (row.featured_tier as Business['featuredTier']) ?? null,
    baseDistance: row.base_distance,
    notes: row.notes,
    imageUrl: row.image_url,
    status: (row.status as Business['status']) ?? null,
    basesServed: row.bases_served ?? [],
    latitude: row.latitude,
    longitude: row.longitude,
    googleMapsUrl: row.google_maps_url,
    isOnBase: row.is_on_base ?? false,
  };
}

/** Reverse mapping — camelCase (frontend) back to snake_case (DB), used by create/update. */
export function mapBusinessToSupabase(business: Partial<Business>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (business.name !== undefined) row.name = business.name;
  if (business.category !== undefined) row.category = business.category;
  if (business.subcategory !== undefined) row.subcategory = business.subcategory;
  if (business.description !== undefined) row.description = business.description;
  if (business.location !== undefined) row.location = business.location;
  if (business.address !== undefined) row.address = business.address;
  if (business.phone !== undefined) row.phone = business.phone;
  if (business.email !== undefined) row.email = business.email;
  if (business.website !== undefined) row.website = business.website;
  if (business.englishFluency !== undefined) row.english_fluency = business.englishFluency;
  if (business.verified !== undefined) row.verified = business.verified;
  if (business.featured !== undefined) row.featured = business.featured;
  if (business.featuredTier !== undefined) row.featured_tier = business.featuredTier;
  if (business.baseDistance !== undefined) row.base_distance = business.baseDistance;
  if (business.notes !== undefined) row.notes = business.notes;
  if (business.imageUrl !== undefined) row.image_url = business.imageUrl;
  if (business.status !== undefined) row.status = business.status;
  if (business.basesServed !== undefined) row.bases_served = business.basesServed;
  if (business.latitude !== undefined) row.latitude = business.latitude;
  if (business.longitude !== undefined) row.longitude = business.longitude;
  if (business.googleMapsUrl !== undefined) row.google_maps_url = business.googleMapsUrl;
  if (business.isOnBase !== undefined) row.is_on_base = business.isOnBase;

  return row;
}

export function mapSupabaseToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    businessId: row.business_id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}
