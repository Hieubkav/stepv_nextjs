// Settings table structure - single record with key='site' containing all site config as JSON value
export interface Settings {
  // Branding
  siteName?: string;
  logoUrl?: string;

  // Contact info
  contactEmail?: string;
  address?: string;
  zaloUrl?: string;

  // Social media
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
}

// Helper type for getting setting values
export type SettingKey = keyof Settings;

