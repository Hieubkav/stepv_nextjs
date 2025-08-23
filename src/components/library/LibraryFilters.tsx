'use client';

import React from 'react';
import Image from 'next/image';

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
    { value: 'all', label: 'ALL', image: null },
    { value: 'After Effects', label: 'AE', image: '/images/icon_design/ae_icon.webp' },
    { value: 'Premiere Pro', label: 'PR', image: '/images/icon_design/premiere-pro.png' },
    { value: 'Blender', label: 'BLENDER', image: '/images/icon_design/Blender_logo_no_text.svg.png' },
    { value: 'Cinema 4D', label: 'C4D', image: '/images/icon_design/c4d.png' },
    { value: '3DS Max', label: '3DS MAX', image: '/images/icon_design/3ds-max-logo-png_seeklogo-482396.png' },
    { value: 'Unreal Engine', label: 'UNREAL', image: '/images/icon_design/unreal.jpg' },
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
                className={`px-4 py-2.5 rounded-lg text-sm font-bold uppercase transition-all duration-200 min-w-[60px] flex items-center gap-2.5 ${
                  selectedType === type.value
                    ? 'bg-yellow-400 text-black shadow-lg transform scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600'
                }`}
              >
                {type.image && (
                  <div className="w-6 h-6 flex items-center justify-center">
                    {type.label === 'BLENDER' ? (
                      // Fallback for Blender
                      <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                    ) : (
                      <Image
                        src={type.image}
                        alt={type.label}
                        width={24}
                        height={24}
                        className="object-contain filter brightness-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-5 h-5 bg-gray-600 rounded flex items-center justify-center"><span class="text-white text-xs font-bold">${type.label.charAt(0)}</span></div>`;
                          }
                        }}
                      />
                    )}
                  </div>
                )}
                <span className="whitespace-nowrap">{type.label}</span>
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
