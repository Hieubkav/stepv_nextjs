'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItem {
  number: string;
  label: string;
  delay?: number;
}

interface StatsSectionProps {
  stats?: StatItem[];
  backgroundColor?: string;
}

const StatsSection = ({
  stats = [
    { number: '5+', label: 'Years of Experience', delay: 100 },
    { number: '100+', label: 'Completed Projects', delay: 200 },
    { number: '50+', label: 'Supporters Worldwide', delay: 300 },
    { number: '1000+', label: 'Visuals Rendered', delay: 400 }
  ],
  backgroundColor = 'bg-gray-900'
}: StatsSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Calculate grid columns based on stats count
  const statsCount = stats.length;
  const getGridCols = () => {
    switch (statsCount) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      case 4: return 'grid-cols-2 md:grid-cols-4';
      case 5: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case 6: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      default: return 'grid-cols-2 md:grid-cols-4';
    }
  };

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="stats" 
      className={`py-20 ${backgroundColor}`}
    >
      <div className="container mx-auto px-4">
        <div className={`grid ${getGridCols()} gap-8 text-center`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`transform transition-all duration-1000 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-8 opacity-0'
              }`}
              style={{
                transitionDelay: `${stat.delay || (index + 1) * 100}ms`
              }}
            >
              {/* Number */}
              <div className="relative mb-2">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 relative z-10">
                  {stat.number}
                </div>
              </div>

              {/* Label */}
              <div className="text-gray-400 text-sm md:text-base lg:text-lg font-medium tracking-wide">
                {stat.label}
              </div>

              {/* Decorative line */}
              <div className="mt-4 mx-auto w-12 h-0.5 bg-gray-600 opacity-60"></div>
            </div>
          ))}
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Counter animation effect */
        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Pulse effect for numbers */
        .text-transparent {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        /* Responsive text scaling */
        @media (max-width: 640px) {
          .text-4xl {
            font-size: 2.5rem;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .md\\:text-5xl {
            font-size: 3.5rem;
          }
        }

        @media (min-width: 1024px) {
          .lg\\:text-6xl {
            font-size: 4rem;
          }
        }

        /* Smooth transitions */
        .transform {
          will-change: transform, opacity;
        }
      `}</style>
    </section>
  );
};

export default StatsSection;