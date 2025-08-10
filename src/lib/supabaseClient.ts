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
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: string;
          pricing: string;
          image_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: string;
          pricing?: string;
          image_url?: string;
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
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
