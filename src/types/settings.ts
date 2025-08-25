// Settings table structure - single record with multiple columns
export interface Settings {
  id: string;

  // Payment settings
  bank_name?: string;
  bank_account?: string;
  bank_account_name?: string;
  payment_qr_code?: string;

  // Contact settings
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;

  // General settings
  site_name?: string;
  site_description?: string;

  // SEO settings
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;

  // Social settings
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  pinterest_url?: string;
  x_url?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Request interfaces for updating settings
export interface UpdateSettingsRequest {
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
}

// Helper type for getting setting values
export type SettingKey = keyof Omit<Settings, 'id' | 'created_at' | 'updated_at'>;
