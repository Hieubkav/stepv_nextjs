'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './useToast';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

interface UploadResult {
  url: string;
  path: string;
  fullUrl: string;
}

// Utility function to extract file path from Supabase URL
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  try {
    if (!url) return null;

    // Supabase storage URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Find bucket index in path
    const bucketIndex = pathParts.indexOf(bucket);
    if (bucketIndex === -1) return null;

    // Get path after bucket name
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    return filePath || null;
  } catch (error) {
    console.error('❌ Error extracting file path from URL:', error);
    return null;
  }
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { success, error } = useToast();

  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file size
      const maxSize = (options.maxSizeInMB || 5) * 1024 * 1024; // Default 5MB
      if (file.size > maxSize) {
        error('Lỗi upload', `File quá lớn. Tối đa ${options.maxSizeInMB || 5}MB`);
        return null;
      }

      // Validate file type
      const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        error('Lỗi upload', 'Định dạng file không được hỗ trợ');
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const folder = options.folder || 'uploads';
      const filePath = `${folder}/${fileName}`;

      console.log('🔄 Uploading file:', { fileName, filePath, size: file.size, type: file.type });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        
        // Handle specific errors
        if (uploadError.message.includes('Bucket not found')) {
          error('Lỗi cấu hình', 'Bucket storage chưa được tạo. Vui lòng liên hệ admin.');
        } else if (uploadError.message.includes('already exists')) {
          error('Lỗi upload', 'File đã tồn tại. Vui lòng thử lại.');
        } else {
          error('Lỗi upload', uploadError.message);
        }
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      const result: UploadResult = {
        url: urlData.publicUrl,
        path: filePath,
        fullUrl: urlData.publicUrl
      };

      console.log('✅ Upload successful:', result);
      success('Upload thành công', 'File đã được upload thành công!');

      return result;
    } catch (err) {
      console.error('❌ Unexpected upload error:', err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi upload file');
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [success, error]);

  const deleteFile = useCallback(async (
    bucket: string,
    filePath: string
  ): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        error('Lỗi xóa file', deleteError.message);
        return false;
      }

      success('Xóa thành công', 'File đã được xóa thành công!');
      return true;
    } catch (err) {
      console.error('❌ Unexpected delete error:', err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi xóa file');
      return false;
    }
  }, [success, error]);

  const createBucket = useCallback(async (bucketName: string): Promise<boolean> => {
    try {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Create bucket error:', createError);
        if (!createError.message.includes('already exists')) {
          error('Lỗi tạo bucket', createError.message);
          return false;
        }
      }

      success('Bucket sẵn sàng', `Bucket "${bucketName}" đã sẵn sàng sử dụng!`);
      return true;
    } catch (err) {
      console.error('❌ Unexpected create bucket error:', err);
      error('Lỗi không mong muốn', 'Có lỗi xảy ra khi tạo bucket');
      return false;
    }
  }, [success, error]);

  return {
    uploading,
    progress,
    uploadFile,
    deleteFile,
    createBucket
  };
}
