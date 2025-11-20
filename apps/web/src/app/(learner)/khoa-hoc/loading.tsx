import { Skeleton } from '@/components/ui/skeleton';

export default function KhoaHocLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white pb-2 pt-6 text-slate-900 md:pt-8">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-6 w-96 rounded-lg" />
          </div>

          {/* Filter Bar Skeleton */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-28 rounded-full" />
              ))}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Skeleton className="h-10 w-full flex-1 rounded-lg md:max-w-sm" />
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
          </section>
        </div>

        {/* Course Grid Skeleton */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex h-full flex-col overflow-hidden rounded-lg border-2 border-slate-200 bg-white">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3 rounded-md" />
                  <Skeleton className="h-3 w-full rounded-md" />
                  <Skeleton className="h-3 w-4/5 rounded-md" />
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
