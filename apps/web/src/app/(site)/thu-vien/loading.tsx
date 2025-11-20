import { Skeleton } from '@/components/ui/skeleton';

export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0a12] to-black px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-6 w-96 rounded-lg" />
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden w-64 flex-shrink-0 lg:block space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-full rounded-lg" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-full rounded-lg" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 space-y-6">
            {/* Resource Grid Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0c0a12]">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-5 w-2/3 rounded-lg" />
                    <Skeleton className="h-3 w-full rounded-lg" />
                    <Skeleton className="h-3 w-5/6 rounded-lg" />
                    <Skeleton className="mt-auto h-4 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
