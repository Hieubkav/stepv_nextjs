'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';

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

  const { addToast } = useToast();

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
    setFormData(prev => ({
      ...prev,
      brands: [...prev.brands, { url: '', alt: '' }]
    }));
  };

  const removeBrand = (index: number) => {
    const newBrands = formData.brands.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      brands: newBrands
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);

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

      addToast({
        type: 'success',
        message: 'HeroSection đã được cập nhật thành công!'
      });

      onSave();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      addToast({
        type: 'error',
        message: `Lỗi cập nhật: ${errorMessage}`
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-home text-purple-600 mr-3"></i>
                Chỉnh sửa: HeroSection
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Cấu hình section hero với video background và brand logos
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề chính
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tiêu đề chính của hero section"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Background
                </label>
                <input
                  type="text"
                  value={formData.videoBackground}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoBackground: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="/hero-glass.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phụ đề
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Phụ đề mô tả ngắn gọn"
              />
            </div>

            {/* Title Lines */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Dòng tiêu đề động (Title Lines)
                </label>
                <button
                  onClick={addTitleLine}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Dòng ${index + 1}`}
                    />
                    {formData.titleLines.length > 1 && (
                      <button
                        onClick={() => removeTitleLine(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Các dòng tiêu đề sẽ hiển thị luân phiên với hiệu ứng chuyển động
              </p>
            </div>

            {/* Brand Logos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Brand Logos
                </label>
                <button
                  onClick={addBrand}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Thêm brand
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.brands.map((brand, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={brand.url}
                        onChange={(e) => updateBrand(index, 'url', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="URL hình ảnh"
                      />
                      <input
                        type="text"
                        value={brand.alt}
                        onChange={(e) => updateBrand(index, 'alt', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Alt text"
                      />
                    </div>
                    <button
                      onClick={() => removeBrand(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Logos sẽ hiển thị dưới dạng carousel cuộn ngang
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionEditForm;
