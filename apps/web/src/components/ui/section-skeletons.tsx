import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

export const HeroSkeleton = () => (
  <div className="relative h-screen w-full bg-gradient-to-b from-gray-900 to-black overflow-hidden">
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4">
      <div className="space-y-4 text-center max-w-2xl">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-3/4 rounded-lg mx-auto" />
        <Skeleton className="h-16 w-2/3 rounded-lg mx-auto" />
      </div>
      <Skeleton className="h-6 w-96 rounded-lg" />
      <div className="flex gap-4 mt-4">
        <Skeleton className="h-12 w-40 rounded-lg" />
        <Skeleton className="h-12 w-48 rounded-lg" />
      </div>
    </div>
  </div>
);

export const WordSliderSkeleton = () => (
  <div className="h-32 bg-gray-900 flex items-center justify-center px-4">
    <Skeleton className="h-12 w-full max-w-2xl rounded-lg" />
  </div>
);

export const GallerySkeleton = () => (
  <div className="h-96 bg-gray-900 px-4 py-8">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  </div>
);

export const AdviceSkeleton = () => (
  <div className="h-96 bg-black px-4 py-8">
    <div className="space-y-4 max-w-3xl mx-auto">
      <Skeleton className="h-8 w-2/3 rounded-lg" />
      <Skeleton className="h-6 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="h-64 bg-gray-900 px-4 py-8">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const ServicesSkeleton = () => (
  <div className="h-screen bg-black px-4 py-16">
    <Skeleton className="h-8 w-48 rounded-lg mx-auto mb-12" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const WhyChooseUsSkeleton = () => (
  <div className="h-screen bg-black px-4 py-16">
    <Skeleton className="h-8 w-48 rounded-lg mx-auto mb-8" />
    <Skeleton className="h-6 w-96 rounded-lg mx-auto mb-12" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-6 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const Why3DSkeleton = () => (
  <div className="h-screen bg-black px-4 py-16">
    <Skeleton className="h-8 w-48 rounded-lg mx-auto mb-8" />
    <div className="max-w-4xl mx-auto space-y-8">
      {Array.from({ length: 2 }).map((_, row) => (
        <div key={row} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, col) => (
            <div key={col} className="space-y-2 border border-white/10 rounded-lg p-4">
              <Skeleton className="h-6 w-1/2 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const TurningSkeleton = () => (
  <div className="h-screen bg-black px-4 py-16 flex flex-col items-center justify-center">
    <Skeleton className="h-8 w-48 rounded-lg mb-6" />
    <Skeleton className="h-6 w-96 rounded-lg mb-12" />
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-20 rounded-lg" />
      ))}
    </div>
  </div>
);

export const WeWorkSkeleton = () => (
  <div className="h-screen bg-black px-4 py-16">
    <Skeleton className="h-8 w-48 rounded-lg mx-auto mb-8" />
    <Skeleton className="h-6 w-96 rounded-lg mx-auto mb-12" />
    <div className="space-y-6 max-w-2xl mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/2 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CareSkeleton = () => (
  <div className="h-48 bg-black px-4 py-8 flex items-center justify-center">
    <div className="space-y-4 max-w-xl w-full">
      <Skeleton className="h-8 w-2/3 rounded-lg" />
      <Skeleton className="h-6 w-full rounded-lg" />
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
  </div>
);

export const StayControlSkeleton = () => (
  <div className="h-screen bg-black px-4 py-16">
    <Skeleton className="h-8 w-48 rounded-lg mx-auto mb-8" />
    <Skeleton className="h-6 w-96 rounded-lg mx-auto mb-12" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2 border border-white/10 rounded-lg p-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const ContactSkeleton = () => (
  <div className="h-screen bg-black px-4 py-16">
    <Skeleton className="h-8 w-48 rounded-lg mx-auto mb-8" />
    <Skeleton className="h-6 w-96 rounded-lg mx-auto mb-12" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const HeaderSkeleton = () => (
  <div className="h-24 bg-black border-b border-white/10 px-4 flex items-center justify-between">
    <Skeleton className="h-8 w-32 rounded-lg" />
    <div className="flex gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-20 rounded-lg" />
      ))}
    </div>
  </div>
);

export const FooterSkeleton = () => (
  <div className="h-96 bg-black px-4 py-8 border-t border-white/10">
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32 rounded-lg" />
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  </div>
);
