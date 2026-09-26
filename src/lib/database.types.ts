export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      animal_categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          created_at?: string
        }
      }
      animal_feeds: {
        Row: {
          id: string
          category_id: string
          title: string
          description: string
          video_url: string
          thumbnail_url: string
          feed_type: 'live' | 'looped'
          is_active: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          title: string
          description?: string
          video_url: string
          thumbnail_url?: string
          feed_type: 'live' | 'looped'
          is_active?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          title?: string
          description?: string
          video_url?: string
          thumbnail_url?: string
          feed_type?: 'live' | 'looped'
          is_active?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          feed_id: string
          username: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          feed_id: string
          username?: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          feed_id?: string
          username?: string
          message?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string
          coin_balance: number
          total_coins_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          avatar_url?: string
          coin_balance?: number
          total_coins_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string
          coin_balance?: number
          total_coins_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      coin_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: 'purchase' | 'tip'
          description: string
          feed_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type?: 'purchase' | 'tip'
          description?: string
          feed_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: 'purchase' | 'tip'
          description?: string
          feed_id?: string | null
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          body: string
          image_url: string
          author_name: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          image_url?: string
          author_name?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          image_url?: string
          author_name?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      promo_banners: {
        Row: {
          id: string
          headline: string
          subtext: string
          badge_label: string
          button_text: string
          button_action: string
          button_link: string
          gradient: string
          accent_color: string
          icon_name: string
          image_url: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          headline: string
          subtext?: string
          badge_label?: string
          button_text?: string
          button_action?: string
          button_link?: string
          gradient?: string
          accent_color?: string
          icon_name?: string
          image_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          headline?: string
          subtext?: string
          badge_label?: string
          button_text?: string
          button_action?: string
          button_link?: string
          gradient?: string
          accent_color?: string
          icon_name?: string
          image_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      feature_sections: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          image_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      slideshow_images: {
        Row: {
          id: string
          image_url: string
          caption: string
          link_url: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_url: string
          caption?: string
          link_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          caption?: string
          link_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      feed_interactions: {
        Row: {
          id: string
          feed_id: string
          user_id: string
          interaction_type: 'throw_fish' | 'drop_toy' | 'toss_treat' | 'spray_water' | 'ring_bell'
          coin_cost: number
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          feed_id: string
          user_id: string
          interaction_type: 'throw_fish' | 'drop_toy' | 'toss_treat' | 'spray_water' | 'ring_bell'
          coin_cost?: number
          message?: string
          created_at?: string
        }
        Update: {
          id?: string
          feed_id?: string
          user_id?: string
          interaction_type?: 'throw_fish' | 'drop_toy' | 'toss_treat' | 'spray_water' | 'ring_bell'
          coin_cost?: number
          message?: string
          created_at?: string
        }
      }
    }
  }
}

export type AnimalCategory = Database['public']['Tables']['animal_categories']['Row'];
export type AnimalFeed = Database['public']['Tables']['animal_feeds']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type CoinTransaction = Database['public']['Tables']['coin_transactions']['Row'];
export type FeedInteraction = Database['public']['Tables']['feed_interactions']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type PromoBanner = Database['public']['Tables']['promo_banners']['Row'];
export type FeatureSection = Database['public']['Tables']['feature_sections']['Row'];
export type SlideshowImage = Database['public']['Tables']['slideshow_images']['Row'];
