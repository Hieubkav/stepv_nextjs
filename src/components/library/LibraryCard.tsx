'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Database } from '@/lib/supabaseClient';

type Library = Database['public']['Tables']['libraries']['Row'];

interface LibraryCardProps {
  library: Library;
}

export default function LibraryCard({ library }: LibraryCardProps) {
  const isFree = library.pricing.toLowerCase().includes('free');
  
  // Get software icons based on type - parse from actual library.type string
  const getSoftwareIcons = (type: string) => {
    const icons = [];
    const typeStr = type.toLowerCase();

    // Check for each software in the type string
    if (typeStr.includes('ae')) icons.push('ae');
    if (typeStr.includes('pr')) icons.push('pr');
    if (typeStr.includes('blender')) icons.push('bl');
    if (typeStr.includes('ps') || typeStr.includes('photoshop')) icons.push('ps');
    if (typeStr.includes('mo') || typeStr.includes('motion')) icons.push('mo');

    // If no specific software found, default to ae, pr
    if (icons.length === 0) {
      icons.push('ae', 'pr');
    }

    return icons;
  };

  const softwareIcons = getSoftwareIcons(library.type);

  return (
    <Link href={`/thu-vien/${library.id}`} className="group block">
      <div className="relative bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20">
        
        {/* Image Container */}
        <div className="relative h-64 bg-gradient-to-br from-gray-700 to-gray-900">
          {library.image_url ? (
            <Image
              src={library.image_url}
              alt={library.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl text-gray-600">
                <i className="fas fa-image"></i>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Free/Premium Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isFree 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-400 text-black'
            }`}>
              {isFree ? 'Free' : 'Premium'}
            </span>
          </div>

          {/* Software Icons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {softwareIcons.map((icon, index) => (
              <div key={index} className="w-8 h-8 bg-black/50 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase">
                  {icon}
                </span>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors">
              <i className="fas fa-download text-black text-sm"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
            {library.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {library.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {library.type}
              </span>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-400">
                {library.pricing}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
