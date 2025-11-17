// Settings table structure - single record with key='site' containing all site config as JSON value
export interface Settings {
  // Branding (Convex camelCase)
  siteName?: string;
  logoUrl?: string;

  // Contact info
  contactEmail?: string;
  address?: string;
  zaloUrl?: string;

  // Social media (camelCase)
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  pinterestUrl?: string;

  // Bank info
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankCode?: string;

  // Legacy snake_case fields returned by /api/settings
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
}

// Request interfaces for updating settings
export interface UpdateSettingsRequest {
  siteName?: string;
  logoUrl?: string;
  contactEmail?: string;
  address?: string;
  zaloUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  pinterestUrl?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankCode?: string;

  // Allow snake_case payloads for backwards compatibility
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
export type SettingKey = keyof Settings;
