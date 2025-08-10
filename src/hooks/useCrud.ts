'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/supabaseClient';
import { useToast } from './useToast';
import { extractFilePathFromUrl } from './useFileUpload';
import { generateShortId } from '@/utils/uuid';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

export function useCrud<T extends TableName>(tableName: T) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  type Row = Tables[T]['Row'];
  type Insert = Tables[T]['Insert'];
  type Update = Tables[T]['Update'];

  const create = useCallback(async (data: Insert): Promise<Row | null> => {
    try {
      setLoading(true);

      // Ensure ID is provided for all records
      const dataWithId: Insert & { id: string } = {
        ...data,
        id: (data as { id?: string }).id || generateShortId()
      };
      console.log(`🔑 Using ID for ${tableName}:`, dataWithId.id);

      const { data: result, error: createError } = await supabase
        .from(tableName)
        .insert([dataWithId])
        .select()
        .single();

      if (createError) {
        console.error(`❌ Error creating ${tableName}:`, createError);
        console.error('❌ Error details:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        error('Lỗi tạo mới', createError.message);
        return null;
      }

      success('Thành công', `Đã tạo mới ${tableName} thành công!`);
      return result as Row;
    } catch (err) {
      console.error(`❌ Unexpected error creating ${tableName}:`, err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi tạo mới');
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName, success, error]);

  const update = useCallback(async (id: string, data: Update): Promise<Row | null> => {
    try {
      setLoading(true);
      
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Error updating ${tableName}:`, updateError);
        error('Lỗi cập nhật', updateError.message);
        return null;
      }

      success('Thành công', `Đã cập nhật ${tableName} thành công!`);
      return result as Row;
    } catch (err) {
      console.error(`❌ Unexpected error updating ${tableName}:`, err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi cập nhật');
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName, success, error]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      // For libraries, cleanup associated image file before deleting record
      if (tableName === 'libraries') {
        const { data: libraryData } = await supabase
          .from('libraries')
          .select('image_url')
          .eq('id', id)
          .single();

        if (libraryData?.image_url) {
          const filePath = extractFilePathFromUrl(libraryData.image_url, 'library-images');
          if (filePath) {
            console.log('🗑️ Cleaning up library image:', filePath);
            await supabase.storage
              .from('library-images')
              .remove([filePath]);
          }
        }
      }

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error(`❌ Error deleting ${tableName}:`, deleteError);
        error('Lỗi xóa', deleteError.message);
        return false;
      }

      success('Thành công', `Đã xóa ${tableName} thành công!`);
      return true;
    } catch (err) {
      console.error(`❌ Unexpected error deleting ${tableName}:`, err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi xóa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [tableName, success, error]);

  const fetchAll = useCallback(async (): Promise<Row[]> => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error(`❌ Error fetching ${tableName}:`, fetchError);
        error('Lỗi tải dữ liệu', fetchError.message);
        return [];
      }

      return (data as Row[]) || [];
    } catch (err) {
      console.error(`❌ Unexpected error fetching ${tableName}:`, err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi tải dữ liệu');
      return [];
    } finally {
      setLoading(false);
    }
  }, [tableName, error]);

  const fetchById = useCallback(async (id: string): Promise<Row | null> => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error(`❌ Error fetching ${tableName} by id:`, fetchError);
        error('Lỗi tải dữ liệu', fetchError.message);
        return null;
      }

      return data as Row;
    } catch (err) {
      console.error(`❌ Unexpected error fetching ${tableName} by id:`, err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi tải dữ liệu');
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName, error]);

  return {
    loading,
    create,
    update,
    remove,
    fetchAll,
    fetchById,
  };
}
