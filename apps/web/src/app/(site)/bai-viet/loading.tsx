import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#030712] pt-28 pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 space-y-4">
          <Skeleton className="h-10 w-48 bg-slate-800/70" />
          <Skeleton className="h-5 w-96 bg-slate-800/70" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl bg-slate-800/70 mb-8" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914]"
            >
              <Skeleton className="aspect-video w-full rounded-none bg-slate-800/70" />
              <div className="flex flex-1 flex-col gap-3 p-4">
                <Skeleton className="h-3 w-1/3 rounded-md bg-slate-800/70" />
                <Skeleton className="h-5 w-2/3 rounded-md bg-slate-800/70" />
                <Skeleton className="h-3 w-full rounded-md bg-slate-800/70" />
                <Skeleton className="h-3 w-4/5 rounded-md bg-slate-800/70" />
              </div>
              <div className="h-[52px] border-t border-slate-800/70 bg-[#081120]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
