import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <Skeleton className="mb-8 h-10 w-48 rounded-lg" />

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <Skeleton className="mb-2 h-4 w-32 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-8 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
              <Skeleton className="mb-4 h-6 w-48 rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
