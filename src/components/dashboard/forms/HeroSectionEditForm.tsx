'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';
import FileUpload from '@/components/ui/FileUpload';
import { imageCleanup } from '@/utils/imageCleanup';
import '@/styles/hero-form.css';

interface BrandLogo {
  url: string;
  alt: string;
}

interface HeroSectionData {
  id: string;
  title: string;
  subtitle: string;
  config_data: {
    titleLines: string[];
    videoBackground: string;
    brands: BrandLogo[];
  };
}

interface HeroSectionEditFormProps {
  item: HeroSectionData;
  onClose: () => void;
  onSave: () => void;
}

const HeroSectionEditForm: React.FC<HeroSectionEditFormProps> = ({
  item,
  onClose,
  onSave
}) => {
  const [loading, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: item.title || '',
    subtitle: item.subtitle || '',
    titleLines: item.config_data?.titleLines || ['TẠO RA.', 'THU HÚT.', 'CHUYỂN ĐỔI.'],
    videoBackground: item.config_data?.videoBackground || '/hero-glass.jpg',
    brands: item.config_data?.brands || []
  });

  // Input mode states
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'url'>('url');
  const [brandInputModes, setBrandInputModes] = useState<Record<number, 'upload' | 'url'>>({});
  
  // Upload states
  const [videoUploadUrl, setVideoUploadUrl] = useState<string>(item.config_data?.videoBackground || '');
  const [brandUploadUrls, setBrandUploadUrls] = useState<Record<number, string>>({});

  const { addToast } = useToast();

  // Video background upload handlers
  const handleVideoUpload = (url: string, _path: string) => {
    setVideoUploadUrl(url);
    setFormData(prev => ({
      ...prev,
      videoBackground: url
    }));
  };

  const handleVideoUploadError = (error: string) => {
    addToast({
      type: 'error',
      title: 'Lỗi upload',
      message: `Lỗi upload video: ${error}`
    });
  };

  const handleVideoRemove = () => {
    setVideoUploadUrl('');
    setFormData(prev => ({
      ...prev,
      videoBackground: ''
    }));
  };

  // Brand logo upload handlers
  const handleBrandUpload = (index: number, url: string, _path: string) => {
    setBrandUploadUrls(prev => ({ ...prev, [index]: url }));
    updateBrand(index, 'url', url);
  };

  const handleBrandUploadError = (index: number, error: string) => {
    addToast({
      type: 'error',
      title: 'Lỗi upload',
      message: `Lỗi upload brand ${index + 1}: ${error}`
    });
  };

  const handleBrandRemove = (index: number) => {
    setBrandUploadUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[index];
      return newUrls;
    });
    updateBrand(index, 'url', '');
  };

  // Toggle input modes
  const toggleVideoInputMode = (mode: 'upload' | 'url') => {
    setVideoInputMode(mode);
    if (mode === 'url') {
      setVideoUploadUrl('');
    }
  };

  const toggleBrandInputMode = (index: number, mode: 'upload' | 'url') => {
    setBrandInputModes(prev => ({ ...prev, [index]: mode }));
    if (mode === 'url') {
      handleBrandRemove(index);
    }
  };

  // Handle title lines changes
  const updateTitleLine = (index: number, value: string) => {
    const newTitleLines = [...formData.titleLines];
    newTitleLines[index] = value;
    setFormData(prev => ({
      ...prev,
      titleLines: newTitleLines
    }));
  };

  const addTitleLine = () => {
    setFormData(prev => ({
      ...prev,
      titleLines: [...prev.titleLines, '']
    }));
  };

  const removeTitleLine = (index: number) => {
    if (formData.titleLines.length > 1) {
      const newTitleLines = formData.titleLines.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        titleLines: newTitleLines
      }));
    }
  };

  // Handle brands changes
  const updateBrand = (index: number, field: 'url' | 'alt', value: string) => {
    const newBrands = [...formData.brands];
    newBrands[index] = { ...newBrands[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      brands: newBrands
    }));
  };

  const addBrand = () => {
    const newIndex = formData.brands.length;
    setFormData(prev => ({
      ...prev,
      brands: [...prev.brands, { url: '', alt: '' }]
    }));
    setBrandInputModes(prev => ({ ...prev, [newIndex]: 'url' }));
  };

  const removeBrand = (index: number) => {
    // Get old brand URL for cleanup
    const oldBrandUrl = formData.brands[index]?.url;
    
    const newBrands = formData.brands.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      brands: newBrands
    }));
    
    // Remove from upload states
    setBrandUploadUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[index];
      return newUrls;
    });
    setBrandInputModes(prev => {
      const newModes = { ...prev };
      delete newModes[index];
      return newModes;
    });
    
    // Cleanup old image if it was uploaded
    if (oldBrandUrl) {
      imageCleanup.cleanupAfterDelete([oldBrandUrl]);
    }
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);

      // Get old data for cleanup
      const oldVideoBackground = item.config_data?.videoBackground;
      const oldBrands = item.config_data?.brands || [];

      const updateData = {
        title: formData.title,
        subtitle: formData.subtitle,
        config_data: {
          titleLines: formData.titleLines.filter(line => line.trim() !== ''),
          videoBackground: formData.videoBackground,
          brands: formData.brands.filter(brand => brand.url.trim() !== '')
        }
      };

      const { error } = await supabase
        .from('webdesign')
        .update(updateData)
        .eq('id', item.id);

      if (error) {
        throw error;
      }

      // Cleanup old images
      if (oldVideoBackground && oldVideoBackground !== formData.videoBackground) {
        await imageCleanup.cleanupAfterUpdate(oldVideoBackground, formData.videoBackground);
      }
      
      // Cleanup old brand images
      const oldBrandUrls = oldBrands.map(brand => brand.url).filter(url => url);
      const newBrandUrls = formData.brands.map(brand => brand.url).filter(url => url);
      const removedBrandUrls = oldBrandUrls.filter(url => !newBrandUrls.includes(url));
      
      if (removedBrandUrls.length > 0) {
        await imageCleanup.cleanupAfterDelete(removedBrandUrls);
      }

      addToast({
        type: 'success',
        title: 'Thành công',
        message: 'HeroSection đã được cập nhật thành công!'
      });

      onSave();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      addToast({
        type: 'error',
        title: 'Lỗi cập nhật',
        message: `Lỗi cập nhật: ${errorMessage}`
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
      <div className="hero-form relative w-full max-w-4xl bg-white rounded-lg border shadow-lg max-h-[95vh] overflow-hidden flex flex-col">
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa Hero Section</h3>
            <p className="text-sm text-gray-500 mt-1">Cấu hình section chính của trang chủ</p>
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tiêu đề chính
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Nhập tiêu đề chính"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phụ đề
                  </label>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    placeholder="Mô tả ngắn gọn"
                  />
                </div>
              </div>
            </div>
            {/* Video Background */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Video Background</h4>
                <div className="inline-flex rounded-md border border-gray-300">
                  <button
                    type="button"
                    onClick={() => toggleVideoInputMode('upload')}
                    className={`px-3 py-1 text-xs font-medium rounded-l-md transition-colors ${
                      videoInputMode === 'upload'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVideoInputMode('url')}
                    className={`px-3 py-1 text-xs font-medium rounded-r-md border-l transition-colors ${
                      videoInputMode === 'url'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 hover:text-gray-900 border-gray-300'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {videoInputMode === 'upload' ? (
                <div className="space-y-3">
                  <FileUpload
                    onUploadSuccess={handleVideoUpload}
                    onUploadError={handleVideoUploadError}
                    onImageRemove={handleVideoRemove}
                    bucket="webdesign-assets"
                    folder="hero-backgrounds"
                    maxSizeInMB={20}
                    allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']}
                    accept="image/*,video/*"
                    currentImageUrl={videoUploadUrl}
                    disabled={loading}
                    className="w-full"
                    quality={90}
                  />
                  <p className="text-xs text-gray-500">
                    Upload ảnh hoặc video background - tự động tối ưu WebP
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.videoBackground}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoBackground: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="https://example.com/video.mp4"
                  />
                  
                  {/* Preview */}
                  {formData.videoBackground && (
                    <div className="border border-gray-200 rounded-md p-3">
                      {formData.videoBackground.includes('.mp4') || formData.videoBackground.includes('.webm') ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-center min-h-[120px]">
                          <video
                            src={formData.videoBackground}
                            className="max-h-28 max-w-full rounded"
                            controls
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-center min-h-[120px]">
                          <img
                            src={formData.videoBackground}
                            alt="Background preview"
                            className="max-h-28 max-w-full object-contain rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Nhập URL ảnh hoặc video từ internet
                  </p>
                </div>
              )}
            </div>
            </div>

            {/* Title Lines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Dòng tiêu đề động</h4>
                <button
                  onClick={addTitleLine}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Thêm dòng
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.titleLines.map((line, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => updateTitleLine(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder={`Dòng ${index + 1}`}
                    />
                    {formData.titleLines.length > 1 && (
                      <button
                        onClick={() => removeTitleLine(index)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa dòng"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500">
                Các dòng tiêu đề sẽ hiển thị luân phiên với hiệu ứng chuyển động
              </p>
            </div>

            {/* Brand Logos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Brand Logos ({formData.brands.length})</h4>
                <button
                  onClick={addBrand}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Thêm brand
                </button>
              </div>
              
              {formData.brands.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <i className="fas fa-images text-2xl"></i>
                  </div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">Chưa có brand logo</h5>
                  <p className="text-xs text-gray-500 mb-3">Thêm logo để hiển thị trên hero section</p>
                  <button
                    onClick={addBrand}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Thêm brand đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.brands.map((brand, index) => {
                    const inputMode = brandInputModes[index] || 'url';
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-900">Brand {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            {/* Toggle */}
                            <div className="inline-flex rounded-md border border-gray-300">
                              <button
                                type="button"
                                onClick={() => toggleBrandInputMode(index, 'upload')}
                                className={`px-2 py-1 text-xs font-medium rounded-l-md transition-colors ${
                                  inputMode === 'upload'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-700 hover:text-gray-900'
                                }`}
                              >
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleBrandInputMode(index, 'url')}
                                className={`px-2 py-1 text-xs font-medium rounded-r-md border-l transition-colors ${
                                  inputMode === 'url'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-700 hover:text-gray-900 border-gray-300'
                                }`}
                              >
                                URL
                              </button>
                            </div>
                            
                            {/* Delete */}
                            <button
                              onClick={() => removeBrand(index)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Xóa brand"
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        {inputMode === 'upload' ? (
                          <div className="space-y-3">
                            <FileUpload
                              onUploadSuccess={(url, path) => handleBrandUpload(index, url, path)}
                              onUploadError={(error) => handleBrandUploadError(index, error)}
                              onImageRemove={() => handleBrandRemove(index)}
                              bucket="webdesign-assets"
                              folder="brand-logos"
                              maxSizeInMB={5}
                              currentImageUrl={brandUploadUrls[index] || brand.url}
                              disabled={loading}
                              className="w-full"
                              quality={90}
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alt text
                              </label>
                              <input
                                type="text"
                                value={brand.alt}
                                onChange={(e) => updateBrand(index, 'alt', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                placeholder="Mô tả logo"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  URL logo
                                </label>
                                <input
                                  type="text"
                                  value={brand.url}
                                  onChange={(e) => updateBrand(index, 'url', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  placeholder="https://example.com/logo.png"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Alt text
                                </label>
                                <input
                                  type="text"
                                  value={brand.alt}
                                  onChange={(e) => updateBrand(index, 'alt', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  placeholder="Tên brand"
                                />
                              </div>
                            </div>
                            
                            {/* Preview */}
                            {brand.url && (
                              <div className="border border-gray-200 rounded-md p-3">
                                <div className="flex justify-center">
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[120px] min-h-[80px] flex items-center justify-center">
                                    <img
                                      src={brand.url}
                                      alt={brand.alt || 'Brand logo preview'}
                                      className="max-h-16 max-w-24 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Logo sẽ hiển thị dưới dạng carousel trên hero section
              </p>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionEditForm;
