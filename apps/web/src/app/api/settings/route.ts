import { NextResponse } from 'next/server';

// Simple in-memory settings store for dev/local usage
// Note: This will reset on server restart; replace with DB as needed
let currentSettings = {
  id: 'default',
  // Payment
  bank_name: '',
  bank_account: '',
  bank_account_name: '',
  payment_qr_code: '',
  // Contact
  contact_email: 'contact@dohy.studio',
  contact_phone: '',
  contact_address: '',
  // General
  site_name: 'Dohy Studio',
  site_description: 'Creative studio',
  // SEO
  meta_title: 'Dohy Studio',
  meta_description: 'Creative studio',
  meta_keywords: '',
  // Social
  facebook_url:
    'https://www.facebook.com/profile.php?id=61574798173124&sk=friends_likes',
  instagram_url: 'https://www.instagram.com/dohy_studio/',
  youtube_url: 'https://www.youtube.com/@dohystudio',
  tiktok_url: 'https://www.tiktok.com/@dohystudio',
  pinterest_url: '',
  x_url: '',
  // Timestamps
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(currentSettings);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    currentSettings = {
      ...currentSettings,
      ...(body ?? {}),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json(currentSettings);
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}

