'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { Database } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';
import { useCrud } from '@/hooks/useCrud';
import { ToastContainer } from '@/components/ui/Toast';
import CrudModal from '@/components/dashboard/CrudModal';
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';
import SiteSettingsManager from '@/components/admin/SimpleSettingsManager';
import WebDesignManager from '@/components/dashboard/WebDesignManager';
import { setupStorageBuckets, testUpload, cleanupOrphanedFiles } from '@/utils/setupStorage';
import { getSoftwareIcons } from '@/utils/softwareIcons';

type User = Database['public']['Tables']['users']['Row'];
type Library = Database['public']['Tables']['libraries']['Row'];
type LibraryImage = Database['public']['Tables']['library_images']['Row'];

// Extended Library type with optional download fields
interface ExtendedLibrary extends Library {
  download_url?: string;
  download_status?: 'active' | 'inactive' | 'pending' | 'expired' | 'maintenance';
}

interface DashboardStats {
  totalUsers: number;
  totalLibraries: number;
  totalImages: number;
}

interface ModalState {
  isOpen: boolean;
  type: 'users' | 'libraries' | 'library_images';
  mode: 'create' | 'edit';
  editData?: User | Library | LibraryImage | null;
}

interface DeleteModalState {
  isOpen: boolean;
  type: 'users' | 'libraries' | 'library_images';
  item?: User | Library | LibraryImage | null;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalLibraries: 0,
    totalImages: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'libraries' | 'images' | 'webdesign' | 'settings'>('libraries');

  // Toast notifications
  const { toasts, removeToast } = useToast();

  // CRUD hooks
  const usersCrud = useCrud('users');
  const librariesCrud = useCrud('libraries');
  const imagesCrud = useCrud('library_images');

  // Modal states
  const [crudModal, setCrudModal] = useState<ModalState>({
    isOpen: false,
    type: 'users',
    mode: 'create',
    editData: null
  });

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'users',
    item: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // CRUD Handlers
  const openCreateModal = (type: 'users' | 'libraries' | 'library_images') => {
    setCrudModal({
      isOpen: true,
      type,
      mode: 'create',
      editData: null
    });
  };

  const openEditModal = (type: 'users' | 'libraries' | 'library_images', item: User | Library | LibraryImage) => {
    setCrudModal({
      isOpen: true,
      type,
      mode: 'edit',
      editData: item
    });
  };

  const closeCrudModal = () => {
    setCrudModal({
      isOpen: false,
      type: 'users',
      mode: 'create',
      editData: null
    });
  };

  const openDeleteModal = (type: 'users' | 'libraries' | 'library_images', item: User | Library | LibraryImage) => {
    setDeleteModal({
      isOpen: true,
      type,
      item
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      type: 'users',
      item: null
    });
  };

  const handleCrudSubmit = async (data: Record<string, string | undefined>) => {
    const { type, mode } = crudModal;
    let result = null;

    if (mode === 'create') {
      switch (type) {
        case 'users':
          result = await usersCrud.create(data as Database['public']['Tables']['users']['Insert']);
          break;
        case 'libraries':
          result = await librariesCrud.create(data as Database['public']['Tables']['libraries']['Insert']);
          break;
        case 'library_images':
          result = await imagesCrud.create(data as Database['public']['Tables']['library_images']['Insert']);
          break;
      }
    } else {
      const id = crudModal.editData?.id;
      if (!id) return;

      switch (type) {
        case 'users':
          result = await usersCrud.update(id, data as Database['public']['Tables']['users']['Update']);
          break;
        case 'libraries':
          result = await librariesCrud.update(id, data as Database['public']['Tables']['libraries']['Update']);
          break;
        case 'library_images':
          result = await imagesCrud.update(id, data as Database['public']['Tables']['library_images']['Update']);
          break;
      }
    }

    if (result) {
      await fetchDashboardData(); // Refresh data
    }
  };

  const handleDelete = async () => {
    const { type, item } = deleteModal;
    if (!item?.id) return;

    let success = false;

    switch (type) {
      case 'users':
        success = await usersCrud.remove(item.id);
        break;
      case 'libraries':
        success = await librariesCrud.remove(item.id);
        break;
      case 'library_images':
        success = await imagesCrud.remove(item.id);
        break;
    }

    if (success) {
      await fetchDashboardData(); // Refresh data
    }
  };

  const handleSetupStorage = async () => {
    console.log('🔄 Setting up Supabase Storage...');
    const success = await setupStorageBuckets();
    if (success) {
      console.log('✅ Storage setup completed');
      await testUpload();
    }
  };

  const handleCleanupStorage = async () => {
    console.log('🧹 Starting storage cleanup...');
    const success = await cleanupOrphanedFiles();
    if (success) {
      console.log('✅ Storage cleanup completed');
    }
  };

  const createTestLibrary = async () => {
    try {
      console.log('🧪 Creating test library...');
      const testLibrary = {
        title: 'Test Library',
        description: 'Test library created from dashboard',
        type: 'test',
        pricing: 'free'
      };

      const result = await supabase.from('libraries').insert([testLibrary]).select();
      console.log('🧪 Test library creation result:', result);

      if (result.error) {
        console.error('❌ Failed to create test library:', result.error);
        console.error('❌ Error details:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint
        });
        alert(`❌ Lỗi tạo test library: ${result.error.message}\nCode: ${result.error.code}`);
      } else {
        console.log('✅ Test library created successfully!');
        alert('✅ Test library đã được tạo thành công!');
        // Refresh data after creating test library
        fetchDashboardData();
      }
    } catch (error) {
      console.error('❌ Error creating test library:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase not configured. Using mock data.');
        setError('Supabase configuration not found. Please check environment variables.');
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching data from Supabase...');

      // Test basic connection first
      console.log('🧪 Testing basic Supabase connection...');
      const testResponse = await supabase.from('users').select('count', { count: 'exact' });
      console.log('🧪 Test connection result:', testResponse);

      // Test libraries table specifically
      console.log('🧪 Testing libraries table access...');
      const librariesTestResponse = await supabase.from('libraries').select('count', { count: 'exact' });
      console.log('🧪 Libraries test result:', librariesTestResponse);

      // Try to fetch libraries without ordering first
      console.log('🧪 Fetching libraries without ordering...');
      const librariesSimpleResponse = await supabase.from('libraries').select('*');
      console.log('🧪 Libraries simple fetch result:', librariesSimpleResponse);

      // Fetch all data in parallel
      const [usersResponse, librariesResponse, imagesResponse] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('libraries').select('*').order('created_at', { ascending: false }),
        supabase.from('library_images').select('*').order('created_at', { ascending: false })
      ]);

      console.log('📊 API Responses:', {
        users: usersResponse,
        libraries: librariesResponse,
        images: imagesResponse
      });

      // Debug: Log detailed response data
      console.log('🔍 Detailed Users Response:', {
        data: usersResponse.data,
        error: usersResponse.error,
        count: usersResponse.count,
        status: usersResponse.status,
        statusText: usersResponse.statusText
      });

      console.log('🔍 Detailed Libraries Response:', {
        data: librariesResponse.data,
        error: librariesResponse.error,
        count: librariesResponse.count,
        status: librariesResponse.status,
        statusText: librariesResponse.statusText
      });

      console.log('🔍 Detailed Images Response:', {
        data: imagesResponse.data,
        error: imagesResponse.error,
        count: imagesResponse.count,
        status: imagesResponse.status,
        statusText: imagesResponse.statusText
      });

      if (usersResponse.error) {
        console.error('❌ Users error:', usersResponse.error);
        throw new Error(`Users: ${usersResponse.error.message}`);
      }
      if (librariesResponse.error) {
        console.error('❌ Libraries error:', librariesResponse.error);
        throw new Error(`Libraries: ${librariesResponse.error.message}`);
      }
      if (imagesResponse.error) {
        console.error('❌ Images error:', imagesResponse.error);
        throw new Error(`Images: ${imagesResponse.error.message}`);
      }

      const usersData = usersResponse.data || [];
      const librariesData = librariesResponse.data || [];
      const imagesData = imagesResponse.data || [];

      console.log('✅ Data fetched successfully:', {
        users: usersData.length,
        libraries: librariesData.length,
        images: imagesData.length
      });

      setUsers(usersData);
      setLibraries(librariesData);
      setImages(imagesData);

      setStats({
        totalUsers: usersData.length,
        totalLibraries: librariesData.length,
        totalImages: imagesData.length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error fetching dashboard data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu từ Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-circle text-red-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Lỗi kết nối Supabase
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchDashboardData}
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
    <div className="px-3 sm:px-6 lg:px-8">
      {/* Dashboard Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-7 text-gray-900 truncate">
              <i className="fas fa-chart-line text-blue-600 mr-2 sm:mr-3"></i>
              <span className="hidden sm:inline">Dashboard Analytics</span>
              <span className="sm:hidden">Thư viện</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              <span className="hidden sm:inline">Tổng quan dữ liệu từ Supabase Database</span>
              <span className="sm:hidden">Quản lý thư viện</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-sync-alt mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Làm mới</span>
              <span className="sm:hidden">Refresh</span>
            </button>
            <button
              onClick={createTestLibrary}
              className="inline-flex items-center px-2 py-1.5 sm:px-4 sm:py-2 border border-green-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <i className="fas fa-plus mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Test Library</span>
              <span className="sm:hidden">Test</span>
            </button>
            <button
              onClick={handleSetupStorage}
              className="inline-flex items-center px-2 py-1.5 sm:px-4 sm:py-2 border border-purple-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <i className="fas fa-cloud mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Setup Storage</span>
              <span className="sm:hidden">Setup</span>
            </button>
            <button
              onClick={handleCleanupStorage}
              className="inline-flex items-center px-2 py-1.5 sm:px-4 sm:py-2 border border-orange-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <i className="fas fa-broom mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Cleanup Storage</span>
              <span className="sm:hidden">Clean</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            // { key: 'overview', label: 'Tổng quan', icon: 'fas fa-chart-pie' },
            // { key: 'users', label: 'Người dùng', icon: 'fas fa-users' },
            { key: 'libraries', label: 'Thư viện', icon: 'fas fa-book' },
            // { key: 'images', label: 'Hình ảnh', icon: 'fas fa-images' }
            { key: 'webdesign', label: 'WebDesign', icon: 'fas fa-palette' },
            { key: 'settings', label: 'Cài đặt', icon: 'fas fa-cog' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'overview' | 'users' | 'libraries' | 'images' | 'webdesign' | 'settings')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab - Hidden */}
        {false && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-users text-gray-400 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Tổng người dùng
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-book text-gray-400 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Tổng thư viện
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalLibraries}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-images text-gray-400 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Tổng hình ảnh
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalImages}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Hoạt động gần đây
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Dữ liệu mới nhất từ database
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {users.slice(0, 5).map((user) => (
                  <li key={user.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i className="fas fa-user text-blue-600"></i>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            Người dùng mới
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </div>
                    </div>
                  </li>
                ))}
                {users.length === 0 && (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    Chưa có hoạt động nào
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Users Tab - Hidden */}
        {false && activeTab === 'users' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Danh sách người dùng
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Tổng cộng {stats.totalUsers} người dùng
                </p>
              </div>
              <button
                onClick={() => openCreateModal('users')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-plus mr-2"></i>
                Thêm người dùng
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {user.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal('users', user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => openDeleteModal('users', user)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Chưa có người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Libraries Tab - Mobile Optimized */}
        {activeTab === 'libraries' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-3 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                    Danh sách thư viện
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Tổng cộng {stats.totalLibraries} thư viện
                  </p>
                </div>
                <button
                  onClick={() => openCreateModal('libraries')}
                  className="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <i className="fas fa-plus mr-1 sm:mr-2"></i>
                  Thêm thư viện
                </button>
              </div>
            </div>
            {libraries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
                {libraries.map((library) => (
                  <div key={library.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Library Image */}
                    {library.image_url && (
                      <div className="w-full h-40 sm:h-48 relative">
                        <img
                          src={library.image_url}
                          alt={library.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="p-3 sm:p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate flex-1 mr-2">{library.title}</h4>
                        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                          <button
                            onClick={() => openEditModal('libraries', library)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit text-sm"></i>
                          </button>
                          <button
                            onClick={() => openDeleteModal('libraries', library)}
                            className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Xóa"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{library.description}</p>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex flex-wrap gap-1">
                          {getSoftwareIcons(library.type).map((icon, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {icon.name}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-green-600">
                          {library.pricing}
                        </span>
                      </div>

                      {/* Download Info */}
                      {(library as ExtendedLibrary).download_url && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Download:</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium ${
                                (library as ExtendedLibrary).download_status === 'active' ? 'text-green-600' :
                                (library as ExtendedLibrary).download_status === 'inactive' ? 'text-red-600' :
                                (library as ExtendedLibrary).download_status === 'pending' ? 'text-yellow-600' :
                                (library as ExtendedLibrary).download_status === 'expired' ? 'text-red-600' :
                                (library as ExtendedLibrary).download_status === 'maintenance' ? 'text-orange-600' :
                                'text-gray-600'
                              }`}>
                                {(library as ExtendedLibrary).download_status === 'active' ? 'Hoạt động' :
                                 (library as ExtendedLibrary).download_status === 'inactive' ? 'Không hoạt động' :
                                 (library as ExtendedLibrary).download_status === 'pending' ? 'Đang chờ' :
                                 (library as ExtendedLibrary).download_status === 'expired' ? 'Hết hạn' :
                                 (library as ExtendedLibrary).download_status === 'maintenance' ? 'Bảo trì' :
                                 'Không xác định'}
                              </span>
                              {(library as ExtendedLibrary).download_status === 'active' && (
                                <a
                                  href={(library as ExtendedLibrary).download_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Tải về"
                                >
                                  <i className="fas fa-download text-xs"></i>
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="mt-1">
                            <a
                              href={(library as ExtendedLibrary).download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                              title={(library as ExtendedLibrary).download_url}
                            >
                              {(library as ExtendedLibrary).download_url && (library as ExtendedLibrary).download_url!.length > 40
                                ? `${(library as ExtendedLibrary).download_url!.substring(0, 40)}...`
                                : (library as ExtendedLibrary).download_url}
                            </a>
                          </div>
                        </div>
                      )}


                      {/* Link Info */}
                      {library.link_url && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Link:</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium ${
                                library.link_status === 'visible' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {library.link_status === 'visible' ? 'Hiện' : 'Ẩn'}
                              </span>
                              {library.link_status === 'visible' && (
                                <a
                                  href={library.link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Mở link"
                                >
                                  <i className="fas fa-external-link-alt text-xs"></i>
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="mt-1">
                            <a
                              href={library.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                              title={library.link_url}
                            >
                              {library.link_url.length > 40
                                ? `${library.link_url.substring(0, 40)}...`
                                : library.link_url}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 sm:mt-3 text-xs text-gray-500">
                        {formatDate(library.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 px-4">
                <i className="fas fa-book text-gray-400 text-3xl sm:text-4xl mb-3 sm:mb-4"></i>
                <p className="text-sm sm:text-base text-gray-500">Chưa có thư viện nào</p>
                <button
                  onClick={() => openCreateModal('libraries')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tạo thư viện đầu tiên
                </button>
              </div>
            )}
          </div>
        )}

        {/* Images Tab - Hidden */}
        {false && activeTab === 'images' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Danh sách hình ảnh
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Tổng cộng {stats.totalImages} hình ảnh
                </p>
              </div>
              <button
                onClick={() => openCreateModal('library_images')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-plus mr-2"></i>
                Thêm hình ảnh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Library ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {images.map((image) => (
                    <tr key={image.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {image.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {image.library_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a
                          href={image.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-800 truncate block max-w-xs"
                        >
                          {image.image_url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(image.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal('library_images', image)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => openDeleteModal('library_images', image)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {images.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Chưa có hình ảnh nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WebDesign Tab */}
        {activeTab === 'webdesign' && (
          <WebDesignManager />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SiteSettingsManager />
        )}
      </div>

      {/* CRUD Modal */}
      <CrudModal
        isOpen={crudModal.isOpen}
        onClose={closeCrudModal}
        onSubmit={handleCrudSubmit}
        title={
          crudModal.mode === 'create'
            ? `Thêm ${crudModal.type === 'users' ? 'người dùng' : crudModal.type === 'libraries' ? 'thư viện' : 'hình ảnh'}`
            : `Chỉnh sửa ${crudModal.type === 'users' ? 'người dùng' : crudModal.type === 'libraries' ? 'thư viện' : 'hình ảnh'}`
        }
        type={crudModal.type}
        editData={crudModal.editData}
        loading={usersCrud.loading || librariesCrud.loading || imagesCrud.loading}
        libraries={libraries}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa ${deleteModal.type === 'users' ? 'người dùng' : deleteModal.type === 'libraries' ? 'thư viện' : 'hình ảnh'} này không?`}
        itemName={
          deleteModal.item
            ? deleteModal.type === 'users'
              ? (deleteModal.item as User).email
              : deleteModal.type === 'libraries'
              ? (deleteModal.item as Library).title
              : (deleteModal.item as LibraryImage).image_url
            : undefined
        }
        loading={usersCrud.loading || librariesCrud.loading || imagesCrud.loading}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}