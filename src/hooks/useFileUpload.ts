'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './useToast';
import { imageCleanup } from '@/utils/imageCleanup';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  quality?: number; // WebP quality (1-100)
}

interface UploadResult {
  url: string;
  path: string;
  fullUrl: string;
  fileName: string;
  originalName: string;
  processedSize: number;
  originalSize: number;
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

      console.log('🔄 Uploading file via API:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 85));
      }, 200);

      // Prepare form data for API upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', options.bucket);
      formData.append('folder', options.folder || 'uploads');
      formData.append('quality', (options.quality || 80).toString());

      // Upload via API route with WebP conversion
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Upload API error:', errorData);
        error('Lỗi upload', errorData.error || 'Upload thất bại');
        return null;
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ Upload failed:', result);
        error('Lỗi upload', 'Upload thất bại');
        return null;
      }

      const uploadResult: UploadResult = {
        url: result.data.url,
        path: result.data.path,
        fullUrl: result.data.url,
        fileName: result.data.fileName,
        originalName: result.data.originalName,
        processedSize: result.data.processedSize,
        originalSize: result.data.originalSize
      };

      console.log('✅ Upload successful via API:', uploadResult);
      
      const compressionPercent = ((uploadResult.originalSize - uploadResult.processedSize) / uploadResult.originalSize * 100).toFixed(1);
      success('Upload thành công', `File đã được tối ưu WebP (tiết kiệm ${compressionPercent}%)`);

      return uploadResult;
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
      // Use API route for deletion
      const response = await fetch(`/api/upload?bucket=${bucket}&path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Delete API error:', errorData);
        error('Lỗi xóa file', errorData.error || 'Xóa file thất bại');
        return false;
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ Delete failed:', result);
        error('Lỗi xóa file', 'Xóa file thất bại');
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
    createBucket,
    // Cleanup utilities
    cleanupAfterDelete: imageCleanup.cleanupAfterDelete.bind(imageCleanup),
    cleanupAfterUpdate: imageCleanup.cleanupAfterUpdate.bind(imageCleanup),
    runFullCleanup: imageCleanup.runFullCleanup.bind(imageCleanup)
  };
}
