import { Skeleton } from '@/components/ui/skeleton';

export default function StudentInfoLoading() {
  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-8 h-8 w-48 rounded-lg" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
