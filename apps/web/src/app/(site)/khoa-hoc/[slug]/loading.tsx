import { Skeleton } from '@/components/ui/skeleton';

export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-gray-900 to-black px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <Skeleton className="mb-4 h-12 w-3/4 rounded-lg bg-gray-700" />
          <Skeleton className="mb-6 h-6 w-full rounded-lg bg-gray-700" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-40 rounded-lg bg-gray-700" />
            <Skeleton className="h-10 w-40 rounded-lg bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Video */}
            <Skeleton className="aspect-video rounded-lg" />

            {/* Tabs & Content */}
            <div className="space-y-4">
              <div className="flex gap-4 border-b border-gray-200 pb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-24 rounded-lg" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
