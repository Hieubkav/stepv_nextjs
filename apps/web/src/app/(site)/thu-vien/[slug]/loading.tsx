import { Skeleton } from '@/components/ui/skeleton';

export default function ResourceDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0a12] to-black px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <Skeleton className="h-6 w-full rounded-lg" />
          <Skeleton className="h-6 w-5/6 rounded-lg" />
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <Skeleton className="aspect-video rounded-lg" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
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
