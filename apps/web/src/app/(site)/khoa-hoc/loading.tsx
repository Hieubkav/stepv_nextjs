import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-amber-500/25 bg-[#0c0c12] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <Skeleton className="aspect-video w-full rounded-none bg-slate-800/70" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3 rounded-md bg-slate-800/70" />
          <Skeleton className="h-3 w-full rounded-md bg-slate-800/70" />
          <Skeleton className="h-3 w-4/5 rounded-md bg-slate-800/70" />
        </div>
        <div className="mt-auto flex items-center justify-end">
          <Skeleton className="h-4 w-24 rounded-md bg-slate-800/70" />
        </div>
      </div>
      <div className="h-[52px] border-t border-amber-500/25 bg-[#0f0f18]" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#050507] via-[#080810] to-[#0b0b14] pb-12 text-slate-50" style={{ paddingTop: 112 }}>
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-28 rounded bg-slate-800/70" />
          <Skeleton className="h-10 w-64 rounded bg-slate-800/70" />
          <Skeleton className="h-4 w-80 rounded bg-slate-800/70" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-lg bg-slate-800/70" />
          ))}
        </div>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </section>
      </div>
    </main>
  );
}
