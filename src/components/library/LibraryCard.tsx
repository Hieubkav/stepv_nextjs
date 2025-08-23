'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Database } from '@/lib/supabaseClient';
import { getSoftwareIcons, getFormattedSoftwareNames } from '@/utils/softwareIcons';

type Library = Database['public']['Tables']['libraries']['Row'];

interface LibraryCardProps {
  library: Library;
}

export default function LibraryCard({ library }: LibraryCardProps) {
  const isFree = library.pricing.toLowerCase().includes('free');
  const softwareIcons = getSoftwareIcons(library.type);
  const formattedSoftwareNames = getFormattedSoftwareNames(library.type);

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
          <div className="absolute top-3 right-3 flex gap-1.5">
            {softwareIcons.map((icon, index) => (
              <div key={index} className="w-10 h-10 bg-black/70 rounded-lg flex items-center justify-center p-1.5 backdrop-blur-sm border border-white/10">
                {icon.name === 'BL' ? (
                  // Fallback for Blender if image doesn't load
                  <span className="text-white text-xs font-bold">BL</span>
                ) : (
                  <Image
                    src={icon.image}
                    alt={icon.name}
                    width={28}
                    height={28}
                    className="object-contain filter brightness-110"
                    onError={(e) => {
                      // If image fails to load, show text instead
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-white text-xs font-bold">${icon.name}</span>`;
                      }
                    }}
                  />
                )}
              </div>
            ))}
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
                {formattedSoftwareNames}
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
