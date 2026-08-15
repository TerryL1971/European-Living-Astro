// src/services/featuredContentService.ts
// Direct port — no react-router-dom or BaseContext dependency here. This
// is now the single source of truth for featured_content reads/writes;
// FeaturedContentSection.tsx (homepage) should import getFeaturedContent
// from here instead of duplicating the filter logic inline.

import { supabase } from './supabaseClient';
import type { FeaturedContent, FeaturedContentCreate } from '../types/featuredContent';

/**
 * Get active featured content filtered by base
 * @param baseId - The base to filter by ('all' shows content for all bases)
 * @returns Array of featured content items
 */
export async function getFeaturedContent(baseId: string = 'all'): Promise<FeaturedContent[]> {
  try {
    const query = supabase
      .from('featured_content')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching featured content:', error);
      return [];
    }

    if (!data) return [];

    // Filter by base on the client side (because Supabase has limited array query support)
    const filtered = data.filter((item: FeaturedContent) => {
      let basesArray: string[] = [];

      if (Array.isArray(item.bases_served)) {
        basesArray = item.bases_served;
      } else if (typeof item.bases_served === 'string') {
        try {
          basesArray = JSON.parse(item.bases_served);
        } catch {
          basesArray = [item.bases_served];
        }
      }

      if (basesArray.includes('all')) return true;
      if (baseId !== 'all' && basesArray.includes(baseId)) return true;
      if (baseId === 'all') return true;
      return false;
    });

    // Filter by date (only show current items)
    const now = new Date();
    const currentItems = filtered.filter((item: FeaturedContent) => {
      const startDate = item.start_date ? new Date(item.start_date) : null;
      const endDate = item.end_date ? new Date(item.end_date) : null;

      if (startDate && startDate > now) return false;
      if (endDate && endDate < now) return false;
      return true;
    });

    // Limit to 4 items
    return currentItems.slice(0, 4);
  } catch (error) {
    console.error('Unexpected error fetching featured content:', error);
    return [];
  }
}

/**
 * Get all featured content (for admin)
 */
export async function getAllFeaturedContent(): Promise<FeaturedContent[]> {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all featured content:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

/**
 * Create new featured content
 */
export async function createFeaturedContent(content: FeaturedContentCreate): Promise<FeaturedContent | null> {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .insert([content])
      .select()
      .single();

    if (error) {
      console.error('Error creating featured content:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

/**
 * Update featured content
 */
export async function updateFeaturedContent(
  id: string,
  updates: Partial<FeaturedContentCreate>
): Promise<FeaturedContent | null> {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating featured content:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

/**
 * Delete featured content
 */
export async function deleteFeaturedContent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('featured_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting featured content:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}
