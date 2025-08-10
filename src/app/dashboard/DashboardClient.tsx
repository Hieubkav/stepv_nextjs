'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/supabaseClient';

type User = Database['public']['Tables']['users']['Row'];
type Library = Database['public']['Tables']['libraries']['Row'];
type LibraryImage = Database['public']['Tables']['library_images']['Row'];

interface DashboardStats {
  totalUsers: number;
  totalLibraries: number;
  totalImages: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'libraries' | 'images'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              <i className="fas fa-chart-line text-blue-600 mr-3"></i>
              Dashboard Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tổng quan dữ liệu từ Supabase Database
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Làm mới
            </button>
            <button
              onClick={createTestLibrary}
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <i className="fas fa-plus mr-2"></i>
              Test Library
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { key: 'overview', label: 'Tổng quan', icon: 'fas fa-chart-pie' },
            { key: 'users', label: 'Người dùng', icon: 'fas fa-users' },
            { key: 'libraries', label: 'Thư viện', icon: 'fas fa-book' },
            { key: 'images', label: 'Hình ảnh', icon: 'fas fa-images' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Danh sách người dùng
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Tổng cộng {stats.totalUsers} người dùng
              </p>
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
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        Chưa có người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Libraries Tab */}
        {activeTab === 'libraries' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Danh sách thư viện
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Tổng cộng {stats.totalLibraries} thư viện
              </p>
            </div>
            {libraries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {libraries.map((library) => (
                  <div key={library.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{library.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{library.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {library.type}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {library.pricing}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {formatDate(library.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-book text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-500">Chưa có thư viện nào</p>
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Danh sách hình ảnh
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Tổng cộng {stats.totalImages} hình ảnh
              </p>
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
                    </tr>
                  ))}
                  {images.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Chưa có hình ảnh nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}