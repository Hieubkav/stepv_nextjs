'use client';

import React from 'react';
import LibraryCard from './LibraryCard';
import type { Database } from '@/lib/supabaseClient';

type Library = Database['public']['Tables']['libraries']['Row'];

interface LibraryGridProps {
  libraries: Library[];
  loading: boolean;
}

export default function LibraryGrid({ libraries, loading }: LibraryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="h-64 bg-gray-700"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (libraries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl text-gray-600 mb-4">
          <i className="fas fa-folder-open"></i>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Chưa có tài nguyên nào
        </h3>
        <p className="text-gray-400">
          Thư viện đang được cập nhật. Hãy quay lại sau nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {libraries.map((library) => (
        <LibraryCard key={library.id} library={library} />
      ))}
    </div>
  );
}
