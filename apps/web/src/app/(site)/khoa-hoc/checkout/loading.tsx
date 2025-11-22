import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-8 h-8 w-48 rounded-lg" />
        <div className="grid gap-8 md:grid-cols-3">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4 border border-gray-200 rounded-lg p-4">
                <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4 h-fit">
            <Skeleton className="h-6 w-32 rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded-lg" />
              </div>
            ))}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
