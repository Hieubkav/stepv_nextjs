'use client';

import Image from 'next/image';

interface GalleryImage {
  url: string;
  alt: string;
}

interface GalleryPictureSectionProps {
  images?: GalleryImage[];
  animationDuration?: number;
  hoverScale?: number;
}

const GalleryPictureSection = ({
  images = [
    { url: '/images/gallery/1.jpg', alt: 'Step V Studio Project 1' },
    { url: '/images/gallery/montblanc-1.png', alt: 'Montblanc Perfume Visualization' },
    { url: '/images/gallery/2.jpg', alt: 'Step V Studio Project 2' },
    { url: '/images/gallery/jomalone.png', alt: 'Jo Malone Perfume Visualization' },
    { url: '/images/gallery/btso-3.png', alt: 'BTSO Perfume Visualization' },
    { url: '/images/gallery/noir-6.png', alt: 'Noir Perfume Visualization' },
    { url: '/images/gallery/4.jpg', alt: 'Step V Studio Project 4' },
    { url: '/images/gallery/1-duplicate.jpg', alt: 'Step V Studio Project 1 Alt' },
    { url: '/images/gallery/3_00086546.png', alt: 'Luxury Perfume Visualization' },
    { url: '/images/gallery/egeo-1.png', alt: 'Egeo Perfume Visualization' },
    { url: '/images/gallery/bois-1.png', alt: 'Bois Perfume Visualization' },
    { url: '/images/gallery/bois-1-duplicate.png', alt: 'Bois Perfume Visualization Alt' },
    { url: '/images/gallery/desert-rose-4.png', alt: 'Desert Rose Perfume Visualization' },
    { url: '/images/gallery/gdivine6.png', alt: 'Divine Perfume Visualization' },
    { url: '/images/gallery/gdivine6-duplicate.png', alt: 'Divine Perfume Visualization Alt' },
    // Thêm 3 hình để đủ 18 hình
    { url: '/images/gallery/montblanc-1.png', alt: 'Montblanc Perfume Visualization Alt' },
    { url: '/images/gallery/noir-6.png', alt: 'Noir Perfume Visualization Alt' },
    { url: '/images/gallery/egeo-1.png', alt: 'Egeo Perfume Visualization Alt' }
  ],
  animationDuration = 700,
  hoverScale = 1.1
}: GalleryPictureSectionProps) => {

  // Layer configurations for 3-layer tighter smile layout
  const layerConfigs = [
    // Layer 1 (Top): Subtle curve with closer spacing
    [
      ['rotate-1', 45],
      ['-rotate-0.5', 25],
      ['', 12, 'ring-2 ring-white/20'],
      ['rotate-0.5', 12, 'ring-2 ring-white/20'],
      ['-rotate-1', 25],
      ['rotate-1', 45]
    ],
    // Layer 2 (Middle): Center focus with minimal margin
    [
      ['-rotate-0.5', 35],
      ['rotate-1', 15],
      ['', 0, 'ring-2 ring-white/30', true],
      ['-rotate-0.5', 0, 'ring-2 ring-white/30', true],
      ['rotate-0.5', 15],
      ['-rotate-1', 35]
    ],
    // Layer 3 (Bottom): Gentle smile completion
    [
      ['rotate-0.5', 25],
      ['-rotate-1', 8],
      ['', 5, 'ring-1 ring-white/20'],
      ['rotate-1', 5, 'ring-1 ring-white/20'],
      ['-rotate-0.5', 8],
      ['rotate-0.5', 25]
    ]
  ];

  return (
    <section id="gallery" className="hidden lg:block relative bg-gray-900/80 py-20">
      {/* 3-Layer Smile Gallery Layout */}
      <div className="w-full px-2">
        {layerConfigs.map((layerConfig, layerIndex) => (
          <div
            key={layerIndex}
            className={`flex justify-center items-end gap-0.5 ${layerIndex < 2 ? 'mb-2' : ''}`}
          >
            {layerConfig.map((config, imageIndex) => {
              const globalIndex = (layerIndex * 6) + imageIndex;
              const image = images[globalIndex] || images[0];
              const [rotation, margin, ring = '', special = false] = config;
              const hoverClass = rotation ? 'hover:rotate-0' : 'hover:scale-105';

              return (
                <div
                  key={imageIndex}
                  className={`transform ${rotation} ${hoverClass} transition-all duration-${animationDuration} flex-1`}
                  style={{ marginBottom: `${margin}px` }}
                >
                  <div className={`w-full h-44 md:h-52 lg:h-64 relative group cursor-pointer overflow-hidden rounded-2xl shadow-xl ${ring}`}>
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className={`object-cover transition-all duration-${animationDuration} group-hover:scale-${String(hoverScale).replace('.', '')} group-hover:brightness-110`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to local placeholder if image fails to load
                        e.currentTarget.src = '/images/gallery/1.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    {special && (
                      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/5 opacity-50"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        /* Ensure smooth transitions */
        .group {
          will-change: transform;
        }

        /* Custom hover effects */
        .group:hover img {
          filter: brightness(1.1) contrast(1.05);
        }

        /* Responsive adjustments for tighter smile */
        @media (max-width: 1024px) {
          .lg\\:h-64 {
            height: 13rem;
          }
        }

        @media (max-width: 768px) {
          .md\\:h-52 {
            height: 11rem;
          }
        }

        /* Custom rotation classes for subtle smile */
        .rotate-0\\.5 {
          transform: rotate(0.5deg);
        }

        .-rotate-0\\.5 {
          transform: rotate(-0.5deg);
        }

        /* Animation performance optimization */
        .transform {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default GalleryPictureSection;