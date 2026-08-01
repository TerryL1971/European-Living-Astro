export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string | null
          destination_name: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean | null
          reading_time_minutes: number | null
          slug: string
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          destination_name?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          reading_time_minutes?: number | null
          slug: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          destination_name?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          reading_time_minutes?: number | null
          slug?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          base_distance: string | null
          bases_served: string[] | null
          category: string
          created_at: string | null
          description: string | null
          email: string | null
          english_fluency: string | null
          featured: boolean | null
          featured_tier: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_on_base: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          notes: string | null
          phone: string | null
          slug: string
          status: string | null
          subcategory: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          base_distance?: string | null
          bases_served?: string[] | null
          category: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          english_fluency?: string | null
          featured?: boolean | null
          featured_tier?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_on_base?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          slug: string
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          base_distance?: string | null
          bases_served?: string[] | null
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          english_fluency?: string | null
          featured?: boolean | null
          featured_tier?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_on_base?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          slug?: string
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      day_trip_tags: {
        Row: {
          created_at: string
          day_trip_id: string | null
          id: string
          tag_id: string | null
        }
        Insert: {
          created_at?: string
          day_trip_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Update: {
          created_at?: string
          day_trip_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "day_trip_tags_day_trip_id_fkey"
            columns: ["day_trip_id"]
            isOneToOne: false
            referencedRelation: "day_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_trip_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      day_trips: {
        Row: {
          base_id: string
          base_name: string
          best_for: string[]
          best_time_to_visit: string | null
          cost: string
          created_at: string | null
          description: string
          difficulty: string
          distance: string
          drive_time: string
          featured: boolean | null
          food_info: string | null
          full_description: string | null
          hero_image_url: string | null
          id: string
          image_url: string | null
          is_must_see: boolean | null
          latitude: number | null
          local_tips: string | null
          longitude: number | null
          name: string
          official_website: string | null
          rating: number | null
          recommended_duration: string | null
          short_description: string | null
          slug: string | null
          ticket_info: string | null
          train_time: string | null
          updated_at: string | null
          what_to_see: string | null
        }
        Insert: {
          base_id: string
          base_name: string
          best_for: string[]
          best_time_to_visit?: string | null
          cost: string
          created_at?: string | null
          description: string
          difficulty: string
          distance: string
          drive_time: string
          featured?: boolean | null
          food_info?: string | null
          full_description?: string | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_must_see?: boolean | null
          latitude?: number | null
          local_tips?: string | null
          longitude?: number | null
          name: string
          official_website?: string | null
          rating?: number | null
          recommended_duration?: string | null
          short_description?: string | null
          slug?: string | null
          ticket_info?: string | null
          train_time?: string | null
          updated_at?: string | null
          what_to_see?: string | null
        }
        Update: {
          base_id?: string
          base_name?: string
          best_for?: string[]
          best_time_to_visit?: string | null
          cost?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          distance?: string
          drive_time?: string
          featured?: boolean | null
          food_info?: string | null
          full_description?: string | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_must_see?: boolean | null
          latitude?: number | null
          local_tips?: string | null
          longitude?: number | null
          name?: string
          official_website?: string | null
          rating?: number | null
          recommended_duration?: string | null
          short_description?: string | null
          slug?: string | null
          ticket_info?: string | null
          train_time?: string | null
          updated_at?: string | null
          what_to_see?: string | null
        }
        Relationships: []
      }
      featured_content: {
        Row: {
          active: boolean | null
          bases_served: string[] | null
          created_at: string | null
          cta_text: string | null
          description: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_sponsored: boolean | null
          link_url: string | null
          sponsor_name: string | null
          start_date: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          bases_served?: string[] | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          link_url?: string | null
          sponsor_name?: string | null
          start_date?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          bases_served?: string[] | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          link_url?: string | null
          sponsor_name?: string | null
          start_date?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      phrase_categories: {
        Row: {
          icon: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          icon: string
          id: string
          name: string
          sort_order?: number | null
        }
        Update: {
          icon?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      phrases: {
        Row: {
          category_id: string
          created_at: string | null
          english: string
          icon: string | null
          id: string
          language_code: string
          pronunciation: string
          sort_order: number | null
          translation: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          english: string
          icon?: string | null
          id?: string
          language_code: string
          pronunciation: string
          sort_order?: number | null
          translation: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          english?: string
          icon?: string | null
          id?: string
          language_code?: string
          pronunciation?: string
          sort_order?: number | null
          translation?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          business_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
        }
        Insert: {
          author_name: string
          business_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
        }
        Update: {
          author_name?: string
          business_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_saved_trips: {
        Row: {
          created_at: string
          day_trip_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_trip_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_trip_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_trips_day_trip_id_fkey"
            columns: ["day_trip_id"]
            isOneToOne: false
            referencedRelation: "day_trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
