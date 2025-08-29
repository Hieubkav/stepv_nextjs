'use client';

import React, { useState, useEffect } from 'react';
import type { Database } from '@/lib/supabaseClient';
import FileUpload from '@/components/ui/FileUpload';

type User = Database['public']['Tables']['users']['Row'];
type Library = Database['public']['Tables']['libraries']['Row'];
type LibraryImage = Database['public']['Tables']['library_images']['Row'];

type FormData = Record<string, string | undefined>;

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  title: string;
  type: 'users' | 'libraries' | 'library_images';
  editData?: User | Library | LibraryImage | null;
  loading?: boolean;
  libraries?: Library[]; // For library_images dropdown
}

const CrudModal: React.FC<CrudModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  type,
  editData,
  loading = false,
  libraries = []
}) => {
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload'); // Toggle between upload and URL input

  // Initialize form data
  useEffect(() => {
    if (editData) {
      setFormData(editData);
      // Set uploaded image URL for libraries if exists
      if (type === 'libraries' && (editData as Library).image_url) {
        setUploadedImageUrl((editData as Library).image_url || '');
      }
      // Parse existing types for libraries
      if (type === 'libraries' && (editData as Library).type) {
        const existingTypes = (editData as Library).type.split(', ').filter(t => t.trim());
        setSelectedTypes(existingTypes);
      }
    } else {
      // Reset form for new entries
      switch (type) {
        case 'users':
          setFormData({ email: '', password_hash: '' });
          break;
        case 'libraries':
          setFormData({
            title: '',
            description: '',
            type: '',
            pricing: '',
            image_url: '',
            link_url: '',
            link_status: 'visible'
          });
          setSelectedTypes([]);
          break;
        case 'library_images':
          setFormData({ library_id: '', image_url: '' });
          break;
      }
      setUploadedImageUrl('');
      setImageInputMode('upload');
    }
    setErrors({});
  }, [editData, type, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (type) {
      case 'users':
        if (!formData.email?.trim()) newErrors.email = 'Email là bắt buộc';
        if (!editData && !formData.password_hash?.trim()) newErrors.password_hash = 'Mật khẩu là bắt buộc';
        break;
      case 'libraries':
        if (!formData.title?.trim()) newErrors.title = 'Tiêu đề là bắt buộc';
        if (!formData.description?.trim()) newErrors.description = 'Mô tả là bắt buộc';
        if (!formData.type?.trim()) newErrors.type = 'Loại là bắt buộc';
        if (!formData.pricing?.trim()) newErrors.pricing = 'Giá là bắt buộc';
        break;
      case 'library_images':
        if (!formData.library_id?.trim()) newErrors.library_id = 'Thư viện là bắt buộc';
        if (!formData.image_url?.trim()) newErrors.image_url = 'URL hình ảnh là bắt buộc';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (url: string, _path: string) => {
    setUploadedImageUrl(url);
    setFormData(prev => ({ ...prev, image_url: url }));
    // Clear any image_url errors
    if (errors.image_url) {
      setErrors(prev => ({ ...prev, image_url: '' }));
    }
  };

  const handleImageUploadError = (error: string) => {
    setErrors(prev => ({ ...prev, image_url: error }));
  };

  const handleImageRemove = () => {
    setUploadedImageUrl('');
    setFormData((prev: Partial<FormData>) => ({ ...prev, image_url: '' }));
    // Clear any image_url errors
    if (errors.image_url) {
      setErrors(prev => ({ ...prev, image_url: '' }));
    }
  };

  const handleTypeChange = (typeValue: string, checked: boolean) => {
    let newSelectedTypes: string[];

    if (checked) {
      newSelectedTypes = [...selectedTypes, typeValue];
    } else {
      newSelectedTypes = selectedTypes.filter(t => t !== typeValue);
    }

    setSelectedTypes(newSelectedTypes);

    // Update form data with comma-separated string
    const typeString = newSelectedTypes.join(', ');
    setFormData((prev: Partial<FormData>) => ({ ...prev, type: typeString }));

    // Clear type errors
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
  };

  const renderFormFields = () => {
    switch (type) {
      case 'users':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            {!editData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={formData.password_hash || ''}
                  onChange={(e) => handleInputChange('password_hash', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password_hash ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                {errors.password_hash && <p className="text-red-500 text-xs mt-1">{errors.password_hash}</p>}
              </div>
            )}
          </>
        );

      case 'libraries':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tiêu đề"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập mô tả"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại * (có thể chọn nhiều)
              </label>
              <div className={`space-y-2 p-3 border rounded-md ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}>
                {['Ae', 'Pr', 'Blender', 'C4D', '3DS Max', 'Unreal'].map((typeOption) => (
                  <label key={typeOption} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(typeOption)}
                      onChange={(e) => handleTypeChange(typeOption, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{typeOption}</span>
                  </label>
                ))}
              </div>
              {selectedTypes.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Đã chọn: {selectedTypes.join(', ')}
                </p>
              )}
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá *
              </label>
              <select
                value={formData.pricing || ''}
                onChange={(e) => handleInputChange('pricing', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pricing ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn giá</option>
                <option value="Free">Free</option>
                <option value="Pay">Pay</option>
              </select>
              {errors.pricing && <p className="text-red-500 text-xs mt-1">{errors.pricing}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hình ảnh thư viện
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      imageInputMode === 'upload'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <i className="fas fa-upload mr-1"></i>
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      imageInputMode === 'url'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <i className="fas fa-link mr-1"></i>
                    URL
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <>
                  <FileUpload
                    onUploadSuccess={handleImageUpload}
                    onUploadError={handleImageUploadError}
                    onImageRemove={handleImageRemove}
                    bucket="library-images"
                    folder="libraries"
                    maxSizeInMB={10}
                    currentImageUrl={uploadedImageUrl}
                    disabled={loading}
                    className="w-full"
                    quality={85} // Higher quality for library images
                  />
                  {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload ảnh đại diện cho thư viện (tự động chuyển WebP, tối ưu SEO)
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => {
                      handleInputChange('image_url', e.target.value);
                      setUploadedImageUrl(e.target.value);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.image_url ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập URL ảnh từ internet (không bắt buộc)
                  </p>
                  
                  {/* Preview for URL input */}
                  {formData.image_url && (
                    <div className="mt-2 p-2 border rounded-md bg-gray-50">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="max-h-32 max-w-full rounded-md shadow-sm mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Link
              </label>
              <input
                type="url"
                value={formData.link_url || ''}
                onChange={(e) => handleInputChange('link_url', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.link_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/page"
              />
              {errors.link_url && <p className="text-red-500 text-xs mt-1">{errors.link_url}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Link mở trang mới (không bắt buộc)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái Link
              </label>
              <select
                value={formData.link_status || 'visible'}
                onChange={(e) => handleInputChange('link_status', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.link_status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="visible">Hiện</option>
                <option value="hidden">Ẩn</option>
              </select>
              {errors.link_status && <p className="text-red-500 text-xs mt-1">{errors.link_status}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Hiển thị hoặc ẩn link trên giao diện
              </p>
            </div>
          </>
        );

      case 'library_images':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thư viện *
              </label>
              <select
                value={formData.library_id || ''}
                onChange={(e) => handleInputChange('library_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.library_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn thư viện</option>
                {libraries.map((library) => (
                  <option key={library.id} value={library.id}>
                    {library.title}
                  </option>
                ))}
              </select>
              {errors.library_id && <p className="text-red-500 text-xs mt-1">{errors.library_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Hình ảnh *
              </label>
              <input
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.image_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
              {editData ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudModal;
