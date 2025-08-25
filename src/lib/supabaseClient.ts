// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
      libraries: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: string;
          pricing: string;
          image_url?: string;
          link_url?: string;
          link_status?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: string;
          pricing: string;
          image_url?: string;
          link_url?: string;
          link_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: string;
          pricing?: string;
          image_url?: string;
          link_url?: string;
          link_status?: string;
          created_at?: string;
        };
      };
      library_images: {
        Row: {
          id: string;
          library_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          library_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          library_id?: string;
          image_url?: string;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          bank_name?: string;
          bank_account?: string;
          bank_account_name?: string;
          payment_qr_code?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          site_name?: string;
          site_description?: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string;
          facebook_url?: string;
          instagram_url?: string;
          youtube_url?: string;
          tiktok_url?: string;
          pinterest_url?: string;
          x_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bank_name?: string;
          bank_account?: string;
          bank_account_name?: string;
          payment_qr_code?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          site_name?: string;
          site_description?: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string;
          facebook_url?: string;
          instagram_url?: string;
          youtube_url?: string;
          tiktok_url?: string;
          pinterest_url?: string;
          x_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bank_name?: string;
          bank_account?: string;
          bank_account_name?: string;
          payment_qr_code?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          site_name?: string;
          site_description?: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string;
          facebook_url?: string;
          instagram_url?: string;
          youtube_url?: string;
          tiktok_url?: string;
          pinterest_url?: string;
          x_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Safe environment variable access with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client with error handling
export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables not found. Client will be limited.');
      // Return a mock client for static generation
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    // Return a mock client as fallback
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
})();

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key');
};
