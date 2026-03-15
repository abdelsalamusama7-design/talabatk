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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
          sender_role?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          current_lat: number | null
          current_lng: number | null
          id: string
          id_card_url: string | null
          license_number: string | null
          phone: string | null
          rating: number | null
          selfie_with_id_url: string | null
          status: Database["public"]["Enums"]["driver_status"] | null
          total_deliveries: number | null
          total_earnings: number | null
          updated_at: string
          user_id: string
          vehicle_type: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          id_card_url?: string | null
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          selfie_with_id_url?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          vehicle_type?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          id_card_url?: string | null
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          selfie_with_id_url?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          restaurant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          restaurant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          restaurant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          action: string
          created_at: string
          id: string
          order_id: string | null
          points: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          order_id?: string | null
          points?: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          order_id?: string | null
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          delivery_address: string | null
          delivery_fee: number
          delivery_lat: number | null
          delivery_lng: number | null
          driver_id: string | null
          estimated_delivery: string | null
          id: string
          items: Json
          notes: string | null
          restaurant_id: string
          scheduled_at: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          driver_id?: string | null
          estimated_delivery?: string | null
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          driver_id?: string | null
          estimated_delivery?: string | null
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id?: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_address: string | null
          default_lat: number | null
          default_lng: number | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_address?: string | null
          default_lat?: number | null
          default_lng?: number | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_address?: string | null
          default_lat?: number | null
          default_lng?: number | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          category: string
          cover_url: string | null
          created_at: string
          delivery_fee: number | null
          delivery_time: string | null
          description: string | null
          id: string
          image_url: string | null
          is_open: boolean | null
          lat: number | null
          lng: number | null
          min_order: number | null
          name: string
          owner_id: string
          phone: string | null
          rating: number | null
          review_count: number | null
          status: Database["public"]["Enums"]["restaurant_status"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_open?: boolean | null
          lat?: number | null
          lng?: number | null
          min_order?: number | null
          name: string
          owner_id: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          status?: Database["public"]["Enums"]["restaurant_status"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_open?: boolean | null
          lat?: number | null
          lng?: number | null
          min_order?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          status?: Database["public"]["Enums"]["restaurant_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          image_url: string | null
          order_id: string | null
          rating: number
          restaurant_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string | null
          rating: number
          restaurant_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string | null
          rating?: number
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      trending_meals: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          meal_description: string | null
          meal_name: string
          menu_item_id: string | null
          prediction_date: string
          price: number | null
          reason: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          meal_description?: string | null
          meal_name: string
          menu_item_id?: string | null
          prediction_date?: string
          price?: number | null
          reason?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          meal_description?: string | null
          meal_name?: string
          menu_item_id?: string | null
          prediction_date?: string
          price?: number | null
          reason?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trending_meals_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trending_meals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "restaurant_owner" | "driver" | "admin"
      driver_status: "offline" | "available" | "busy"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "picked_up"
        | "delivering"
        | "delivered"
        | "cancelled"
      restaurant_status: "pending" | "approved" | "rejected" | "suspended"
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
    Enums: {
      app_role: ["customer", "restaurant_owner", "driver", "admin"],
      driver_status: ["offline", "available", "busy"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "picked_up",
        "delivering",
        "delivered",
        "cancelled",
      ],
      restaurant_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
