'use client';

import React from 'react';

interface LibraryFiltersProps {
  selectedType: string;
  selectedPrice: string;
  sortBy: string;
  onTypeChange: (type: string) => void;
  onPriceChange: (price: string) => void;
  onSortChange: (sort: string) => void;
  totalCount: number;
}

export default function LibraryFilters({
  selectedType,
  selectedPrice,
  sortBy,
  onTypeChange,
  onPriceChange,
  onSortChange,
  totalCount
}: LibraryFiltersProps) {
  const types = [
    { value: 'all', label: 'ALL' },
    { value: 'After Effects', label: 'Ae' },
    { value: 'Premiere Pro', label: 'Pr' },
    { value: '3D Model', label: 'Blender' },
    { value: 'Photoshop', label: 'Ps' },
    { value: 'Motion Graphics', label: 'Mo' },
  ];

  const prices = [
    { value: 'all', label: 'Tất cả' },
    { value: 'free', label: 'Miễn phí' },
    { value: 'paid', label: 'Trả phí' },
  ];

  const sorts = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'name', label: 'Tên A-Z' },
  ];

  return (
    <div className="mb-8">
      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-white mb-1">
            Bộ lọc tài nguyên
          </h2>
          <p className="text-gray-400">
            Tìm thấy {totalCount} tài nguyên
          </p>
        </div>
        
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
          >
            {sorts.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Type Filter */}
        <div className="flex-1">
          <h3 className="text-white font-medium mb-3">Software:</h3>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                className={`px-3 py-2 rounded-lg text-sm font-bold uppercase transition-all duration-200 min-w-[50px] ${
                  selectedType === type.value
                    ? 'bg-yellow-400 text-black shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="flex-1">
          <h3 className="text-white font-medium mb-3">Giá:</h3>
          <div className="flex flex-wrap gap-2">
            {prices.map((price) => (
              <button
                key={price.value}
                onClick={() => onPriceChange(price.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedPrice === price.value
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {price.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
