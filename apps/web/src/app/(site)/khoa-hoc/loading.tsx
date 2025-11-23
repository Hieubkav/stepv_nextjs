import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
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
      <div className="h-[52px] border-t border-slate-800/70 bg-[#081120]" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] pb-12 text-slate-50" style={{ paddingTop: 112 }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute right-[-20%] top-4 h-80 w-80 rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute left-1/3 bottom-[-28%] h-96 w-96 rounded-full bg-indigo-600/8 blur-[190px]" />
      </div>
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
