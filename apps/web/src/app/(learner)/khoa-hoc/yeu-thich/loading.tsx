import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-8 h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
        </div>
      </div>
    </div>
  );
}
