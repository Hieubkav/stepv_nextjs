/**
 * Environment variables validation and utilities
 */

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

/**
 * Get environment configuration with validation
 */
export function getEnvConfig(): EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    supabaseUrl,
    supabaseAnonKey,
    nodeEnv,
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
  };
}

/**
 * Check if all required environment variables are present
 */
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Check if we're in a build/static generation context
 */
export function isBuildTime(): boolean {
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production';
}

/**
 * Safe environment variable access for build time
 */
export function safeGetEnv(key: string, fallback: string = ''): string {
  try {
    return process.env[key] || fallback;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return fallback;
  }
}
