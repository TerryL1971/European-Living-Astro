// src/services/businessServices.ts

import { supabase } from './supabaseClient';
import {
  type Business,
  type Review,
  type ServiceCategory,
  mapSupabaseToBusiness,
  mapBusinessToSupabase,
  mapSupabaseToReview,
} from '../types/business';

export type { Business, Review, ServiceCategory } from '../types/business';

// ==================== FETCH FUNCTIONS ====================

export async function fetchBusinesses(filters?: {
  category?: ServiceCategory;
  subcategory?: string;
  baseId?: string;
  status?: string;
}): Promise<Business[]> {
  try {
    let query = supabase.from('businesses').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'active');
    }

    if (filters?.baseId && filters.baseId !== 'all') {
      query = query.contains('bases_served', [filters.baseId]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToBusiness);
  } catch (error) {
    console.error('Failed to fetch businesses:', error);
    return [];
  }
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
  try {
    const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();

    if (error) {
      console.error('Error fetching business:', error);
      throw error;
    }

    return data ? mapSupabaseToBusiness(data) : null;
  } catch (error) {
    console.error('Failed to fetch business:', error);
    return null;
  }
}

/** Fetch by slug — used by the public /businesses/[slug] route. */
export async function fetchBusinessBySlug(slug: string): Promise<Business | null> {
  try {
    const { data, error } = await supabase.from('businesses').select('*').eq('slug', slug).single();

    if (error) {
      console.error('Error fetching business by slug:', error);
      throw error;
    }

    return data ? mapSupabaseToBusiness(data) : null;
  } catch (error) {
    console.error('Failed to fetch business by slug:', error);
    return null;
  }
}

export async function fetchBusinessesByCategory(category: ServiceCategory, baseId?: string): Promise<Business[]> {
  return fetchBusinesses({ category, baseId });
}

export async function searchBusinesses(
  query: string,
  filters?: { category?: ServiceCategory; baseId?: string }
): Promise<Business[]> {
  try {
    let supabaseQuery = supabase.from('businesses').select('*').eq('status', 'active');

    supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);

    if (filters?.category) {
      supabaseQuery = supabaseQuery.eq('category', filters.category);
    }
    if (filters?.baseId && filters.baseId !== 'all') {
      supabaseQuery = supabaseQuery.contains('bases_served', [filters.baseId]);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToBusiness);
  } catch (error) {
    console.error('Failed to search businesses:', error);
    return [];
  }
}

// ==================== MUTATION FUNCTIONS ====================

export async function createBusiness(business: Partial<Business>): Promise<Business | null> {
  try {
    const supabaseData = mapBusinessToSupabase(business);

    const { data, error } = await supabase.from('businesses').insert([supabaseData]).select().single();

    if (error) {
      console.error('Error creating business:', error);
      throw error;
    }

    return data ? mapSupabaseToBusiness(data) : null;
  } catch (error) {
    console.error('Failed to create business:', error);
    return null;
  }
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<Business | null> {
  try {
    const supabaseData = mapBusinessToSupabase(updates);

    const { data, error } = await supabase.from('businesses').update(supabaseData).eq('id', id).select().single();

    if (error) {
      console.error('Error updating business:', error);
      throw error;
    }

    return data ? mapSupabaseToBusiness(data) : null;
  } catch (error) {
    console.error('Failed to update business:', error);
    return null;
  }
}

export async function deleteBusiness(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('businesses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting business:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete business:', error);
    return false;
  }
}

// ==================== REVIEW FUNCTIONS ====================

export async function fetchReviews(businessId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToReview);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}

export async function createReview(review: {
  businessId: string;
  authorName: string;
  rating: number;
  comment?: string;
}): Promise<Review | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          business_id: review.businessId,
          author_name: review.authorName,
          rating: review.rating,
          comment: review.comment,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    return data ? mapSupabaseToReview(data) : null;
  } catch (error) {
    console.error('Failed to create review:', error);
    return null;
  }
}

// ==================== AGGREGATION FUNCTIONS ====================

export async function getBusinessCountByCategory(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from('businesses').select('category').eq('status', 'active');

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach((item: { category: string }) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Failed to get category counts:', error);
    return {};
  }
}

export async function getFeaturedBusinesses(limit: number = 6): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .limit(limit);

    if (error) throw error;

    return (data || []).map(mapSupabaseToBusiness);
  } catch (error) {
    console.error('Failed to fetch featured businesses:', error);
    return [];
  }
}

// ==================== BACKWARD COMPATIBILITY ALIASES ====================

export const getBusinesses = fetchBusinesses;
export const getBusinessById = fetchBusinessById;
export const getReviewsByBusiness = fetchReviews;
