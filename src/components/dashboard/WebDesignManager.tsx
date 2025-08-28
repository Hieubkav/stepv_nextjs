'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';
import HeroSectionEditForm from './forms/HeroSectionEditForm';

interface WebDesignItem {
  id: string;
  component_name: string;
  component_type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  config_data: Record<string, any> | null;
  position: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface WebDesignManagerProps {
  className?: string;
}

const WebDesignManager: React.FC<WebDesignManagerProps> = ({ className = '' }) => {
  const [webDesignItems, setWebDesignItems] = useState<WebDesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<WebDesignItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { addToast } = useToast();

  // Fetch webdesign data
  const fetchWebDesignData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('webdesign')
        .select('*')
        .order('position', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setWebDesignItems(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error('❌ Error fetching webdesign data:', errorMessage);
      setError(errorMessage);
      addToast({
        type: 'error',
        message: `Lỗi tải dữ liệu: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle visibility
  const toggleVisibility = async (item: WebDesignItem) => {
    try {
      const { error: updateError } = await supabase
        .from('webdesign')
        .update({ is_visible: !item.is_visible })
        .eq('id', item.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setWebDesignItems(prev => 
        prev.map(i => 
          i.id === item.id 
            ? { ...i, is_visible: !i.is_visible }
            : i
        )
      );

      addToast({
        type: 'success',
        message: `${item.component_name} đã được ${!item.is_visible ? 'hiện' : 'ẩn'}`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      addToast({
        type: 'error',
        message: `Lỗi cập nhật: ${errorMessage}`
      });
    }
  };

  // Update position
  const updatePosition = async (item: WebDesignItem, newPosition: number) => {
    try {
      const { error: updateError } = await supabase
        .from('webdesign')
        .update({ position: newPosition })
        .eq('id', item.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh data to get correct order
      await fetchWebDesignData();

      addToast({
        type: 'success',
        message: `Vị trí ${item.component_name} đã được cập nhật`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      addToast({
        type: 'error',
        message: `Lỗi cập nhật vị trí: ${errorMessage}`
      });
    }
  };

  // Open edit modal
  const openEditModal = (item: WebDesignItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingItem(null);
    setShowEditModal(false);
  };

  // Get component type badge color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'hero': 'bg-purple-100 text-purple-800',
      'slider': 'bg-blue-100 text-blue-800',
      'gallery': 'bg-green-100 text-green-800',
      'stats': 'bg-yellow-100 text-yellow-800',
      'services': 'bg-red-100 text-red-800',
      'features': 'bg-indigo-100 text-indigo-800',
      'contact': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.default;
  };

  useEffect(() => {
    fetchWebDesignData();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu WebDesign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-circle text-red-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Lỗi tải dữ liệu WebDesign
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchWebDesignData}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                <i className="fas fa-redo mr-2"></i>
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-palette text-purple-600 mr-3"></i>
              Quản lý WebDesign
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý giao diện và thứ tự hiển thị các component trong trang chủ
            </p>
          </div>
          <button
            onClick={fetchWebDesignData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* WebDesign Items List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách Components ({webDesignItems.length})
          </h3>
        </div>

        {webDesignItems.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-palette text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500">Chưa có component nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {webDesignItems.map((item, index) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                        {item.position}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {item.component_name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.component_type)}`}>
                            {item.component_type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.is_visible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_visible ? 'Hiện' : 'Ẩn'}
                          </span>
                        </div>
                        {item.title && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {item.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Position Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updatePosition(item, item.position - 15)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        <i className="fas fa-chevron-up"></i>
                      </button>
                      <button
                        onClick={() => updatePosition(item, item.position + 15)}
                        disabled={index === webDesignItems.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        <i className="fas fa-chevron-down"></i>
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      onClick={() => toggleVisibility(item)}
                      className={`p-2 rounded-md text-sm font-medium ${
                        item.is_visible
                          ? 'text-red-700 bg-red-100 hover:bg-red-200'
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      }`}
                      title={item.is_visible ? 'Ẩn component' : 'Hiện component'}
                    >
                      <i className={`fas ${item.is_visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md text-sm font-medium"
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <>
          {editingItem.component_name === 'HeroSection' ? (
            <HeroSectionEditForm
              item={editingItem as WebDesignItem & { config_data: { titleLines: string[]; videoBackground: string; brands: Array<{ url: string; alt: string }> } }}
              onClose={closeEditModal}
              onSave={fetchWebDesignData}
            />
          ) : (
            // Default placeholder for other components
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Chỉnh sửa: {editingItem.component_name}
                    </h3>
                    <button
                      onClick={closeEditModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="text-center py-8">
                    <i className="fas fa-tools text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-500">
                      Form chỉnh sửa cho {editingItem.component_name} sẽ được phát triển trong phần tiếp theo
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Component: {editingItem.component_name} | Type: {editingItem.component_type}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WebDesignManager;
