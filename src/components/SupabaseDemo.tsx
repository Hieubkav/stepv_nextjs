'use client';

import React, { useState } from 'react';
import { 
  useProducts, 
  useOrders, 
  useStats, 
  useCreateOrder,
  useRealtimeProducts 
} from '@/hooks/useSupabase';
import { handleSupabaseError } from '../../lib/supabase';

/**
 * Demo component showcasing enhanced Supabase features
 * Dựa trên best practices từ dự án steppv_nextjs
 */
export default function SupabaseDemo() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'stats' | 'realtime'>('products');
  const [email, setEmail] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Using custom hooks
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { orders, loading: ordersLoading, error: ordersError } = useOrders();
  const { stats, loading: statsLoading, error: statsError } = useStats();
  const { createOrder, loading: creatingOrder, error: createOrderError } = useCreateOrder();
  const { products: realtimeProducts, loading: realtimeLoading } = useRealtimeProducts();

  const handleCreateOrder = async () => {
    if (!email || !selectedProductId) {
      alert('Vui lòng nhập email và chọn sản phẩm');
      return;
    }

    try {
      const result = await createOrder({
        email,
        productId: selectedProductId,
      });

      if (result.order) {
        alert('Đặt hàng thành công!');
        setEmail('');
        setSelectedProductId('');
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const TabButton = ({ tab, label, isActive, onClick }: {
    tab: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  const ErrorMessage = ({ error }: { error: string }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <strong>Lỗi:</strong> {error}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🚀 Supabase Enhanced Demo
          </h1>
          <p className="text-gray-600 mt-2">
            Showcase các tính năng Supabase được nâng cấp từ dự án steppv_nextjs
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <TabButton
              tab="products"
              label="📦 Products"
              isActive={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
            />
            <TabButton
              tab="orders"
              label="🛒 Orders"
              isActive={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
            />
            <TabButton
              tab="stats"
              label="📊 Statistics"
              isActive={activeTab === 'stats'}
              onClick={() => setActiveTab('stats')}
            />
            <TabButton
              tab="realtime"
              label="🔄 Real-time"
              isActive={activeTab === 'realtime'}
              onClick={() => setActiveTab('realtime')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Products Management</h2>
                <button
                  onClick={refetchProducts}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={productsLoading}
                >
                  {productsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {productsLoading && <LoadingSpinner />}
              {productsError && <ErrorMessage error={productsError} />}

              {!productsLoading && !productsError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên!
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                        <p className="text-lg font-bold text-green-600 mt-2">
                          ${product.price}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Category: {product.category}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Create Order Form */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Tạo đơn hàng mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="email"
                    placeholder="Email khách hàng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleCreateOrder}
                    disabled={creatingOrder}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {creatingOrder ? 'Đang tạo...' : 'Tạo đơn hàng'}
                  </button>
                </div>
                {createOrderError && (
                  <ErrorMessage error={createOrderError} />
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Orders Management</h2>

              {ordersLoading && <LoadingSpinner />}
              {ordersError && <ErrorMessage error={ordersError} />}

              {!ordersLoading && !ordersError && (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Product</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            Chưa có đơn hàng nào
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="border-t">
                            <td className="px-4 py-2 font-mono text-sm">
                              {order.id.substring(0, 8)}...
                            </td>
                            <td className="px-4 py-2">{order.email}</td>
                            <td className="px-4 py-2">{order.productId}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Database Statistics</h2>

              {statsLoading && <LoadingSpinner />}
              {statsError && <ErrorMessage error={statsError} />}

              {!statsLoading && !statsError && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800">Total Products</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800">Total Orders</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-800">Pending Orders</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real-time Tab */}
          {activeTab === 'realtime' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Real-time Products</h2>
              <p className="text-gray-600 mb-4">
                Dữ liệu này được cập nhật real-time khi có thay đổi trong database
              </p>

              {realtimeLoading && <LoadingSpinner />}

              {!realtimeLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realtimeProducts.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Chưa có sản phẩm nào
                    </div>
                  ) : (
                    realtimeProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            LIVE
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{product.description}</p>
                        <p className="text-lg font-bold text-green-600 mt-2">
                          ${product.price}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
