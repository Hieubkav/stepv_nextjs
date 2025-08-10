'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/supabaseClient';

type User = Database['public']['Tables']['users']['Row'];
type Library = Database['public']['Tables']['libraries']['Row'];
type LibraryImage = Database['public']['Tables']['library_images']['Row'];

// Hook for fetching users
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

// Hook for fetching libraries
export const useLibraries = () => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('libraries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLibraries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  return { libraries, loading, error, refetch: fetchLibraries };
};

// Hook for fetching library images
export const useLibraryImages = () => {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('library_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return { images, loading, error, refetch: fetchImages };
};

// Hook for dashboard stats
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLibraries: 0,
    totalImages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, librariesResponse, imagesResponse] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('libraries').select('id', { count: 'exact', head: true }),
        supabase.from('library_images').select('id', { count: 'exact', head: true })
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (librariesResponse.error) throw librariesResponse.error;
      if (imagesResponse.error) throw imagesResponse.error;

      setStats({
        totalUsers: usersResponse.count || 0,
        totalLibraries: librariesResponse.count || 0,
        totalImages: imagesResponse.count || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

// Hook for creating new library
export const useCreateLibrary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLibrary = async (libraryData: Database['public']['Tables']['libraries']['Insert']) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('libraries')
        .insert([libraryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createLibrary, loading, error };
};

// Hook for creating new library image
export const useCreateLibraryImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLibraryImage = async (imageData: Database['public']['Tables']['library_images']['Insert']) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('library_images')
        .insert([imageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createLibraryImage, loading, error };
};
