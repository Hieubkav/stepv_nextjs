'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFileUpload, extractFilePathFromUrl } from '@/hooks/useFileUpload';

interface FileUploadProps {
  onUploadSuccess: (url: string, path: string) => void;
  onUploadError?: (error: string) => void;
  onImageRemove?: () => void;
  bucket?: string;
  folder?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  accept?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  currentImageUrl?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  onImageRemove,
  bucket = 'library-images',
  folder = 'uploads',
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  accept = 'image/*',
  className = '',
  disabled = false,
  showPreview = true,
  currentImageUrl
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { uploading, progress, uploadFile, createBucket, deleteFile } = useFileUpload();

  // Sync previewUrl with currentImageUrl when it changes
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Create preview
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    try {
      // Delete old file before uploading new one (cleanup)
      if (currentImageUrl) {
        const oldFilePath = extractFilePathFromUrl(currentImageUrl, bucket);
        if (oldFilePath) {
          console.log('🗑️ Cleaning up old file:', oldFilePath);
          await deleteFile(bucket, oldFilePath);
        }
      }

      // Try to upload file
      const result = await uploadFile(file, {
        bucket,
        folder,
        maxSizeInMB,
        allowedTypes
      });

      if (result) {
        onUploadSuccess(result.url, result.path);
      } else {
        // If upload fails due to bucket not found, try to create bucket
        console.log('🔄 Attempting to create bucket and retry upload...');
        const bucketCreated = await createBucket(bucket);
        
        if (bucketCreated) {
          // Retry upload after creating bucket
          const retryResult = await uploadFile(file, {
            bucket,
            folder,
            maxSizeInMB,
            allowedTypes
          });

          if (retryResult) {
            onUploadSuccess(retryResult.url, retryResult.path);
          } else {
            onUploadError?.('Upload thất bại sau khi tạo bucket');
            setPreviewUrl(currentImageUrl || null);
          }
        } else {
          onUploadError?.('Không thể tạo bucket storage');
          setPreviewUrl(currentImageUrl || null);
        }
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      onUploadError?.('Có lỗi xảy ra khi upload file');
      setPreviewUrl(currentImageUrl || null);
    }
  }, [uploadFile, createBucket, bucket, folder, maxSizeInMB, allowedTypes, onUploadSuccess, onUploadError, showPreview, currentImageUrl]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, uploading, handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;
    
    const files = e.target.files;
    handleFiles(files);
  }, [disabled, uploading, handleFiles]);

  const openFileDialog = useCallback(() => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  }, [disabled, uploading]);

  const removePreview = useCallback(async () => {
    // Delete file from storage if it exists
    if (currentImageUrl) {
      const filePath = extractFilePathFromUrl(currentImageUrl, bucket);
      if (filePath) {
        console.log('🗑️ Deleting file from storage:', filePath);
        await deleteFile(bucket, filePath);
      }
    }

    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Notify parent component that image was removed
    onImageRemove?.();
  }, [onImageRemove, currentImageUrl, bucket, deleteFile]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Đang upload... {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-32 max-w-full rounded-lg shadow-md"
                onError={(e) => {
                  console.error('Image load error:', previewUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePreview();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                title="Xóa ảnh"
              >
                ×
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Click để thay đổi ảnh</p>
              <p className="text-xs text-gray-500 mt-1">
                Hoặc click nút × để xóa ảnh hiện tại
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <i className="fas fa-cloud-upload-alt text-4xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click để upload</span> hoặc kéo thả file vào đây
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP, GIF tối đa {maxSizeInMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {!uploading && !previewUrl && (
        <div className="mt-2 text-xs text-gray-500">
          Bucket: {bucket} | Folder: {folder}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
