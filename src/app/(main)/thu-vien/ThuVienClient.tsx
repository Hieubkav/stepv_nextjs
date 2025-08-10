'use client';

import React, { useState } from 'react';
import { useLibraries } from '@/hooks/useSupabase';
import LibraryGrid from '@/components/library/LibraryGrid';
import LibraryFilters from '@/components/library/LibraryFilters';

export default function ThuVienClient() {
  const { libraries, loading, error } = useLibraries();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filter libraries based on selected filters
  const filteredLibraries = libraries.filter(library => {
    const typeMatch = selectedType === 'all' || library.type === selectedType;
    const priceMatch = selectedPrice === 'all' ||
      (selectedPrice === 'free' && library.pricing.toLowerCase().includes('free')) ||
      (selectedPrice === 'paid' && !library.pricing.toLowerCase().includes('free'));

    return typeMatch && priceMatch;
  });

  // Sort libraries
  const sortedLibraries = [...filteredLibraries].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              THƯ VIỆN
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Khám phá bộ sưu tập tài nguyên sáng tạo chất lượng cao cho dự án của bạn
            </p>
          </div>

          {/* Filters */}
          <LibraryFilters
            selectedType={selectedType}
            selectedPrice={selectedPrice}
            sortBy={sortBy}
            onTypeChange={setSelectedType}
            onPriceChange={setSelectedPrice}
            onSortChange={setSortBy}
            totalCount={sortedLibraries.length}
          />

          {/* Library Grid */}
          <LibraryGrid
            libraries={sortedLibraries}
            loading={loading}
          />

        </div>
      </div>
    </main>
  );
}
