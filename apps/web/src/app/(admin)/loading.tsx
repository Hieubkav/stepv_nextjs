import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <Skeleton className="mb-8 h-10 w-48 rounded-lg" />

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-lg" />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2 rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-24 rounded-lg flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
