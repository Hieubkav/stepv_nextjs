'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, UpdateSettingsRequest, SettingKey } from '@/types/settings';

interface UseSettingsReturn {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: UpdateSettingsRequest) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  getSetting: (key: SettingKey, defaultValue?: string) => string;
}

export function useSiteSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(errorMessage);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: UpdateSettingsRequest): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('Error updating settings:', err);
      return false;
    }
  }, []);

  // Get specific setting value with default fallback
  const getSetting = useCallback((key: SettingKey, defaultValue: string = ''): string => {
    if (!settings) return defaultValue;
    return settings[key] || defaultValue;
  }, [settings]);

  // Refresh settings (alias for fetchSettings)
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
    getSetting,
  };
}
