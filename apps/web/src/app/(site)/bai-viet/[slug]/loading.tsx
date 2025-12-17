import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#030712] pt-28 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-slate-800/70" />
            <Skeleton className="h-4 w-32 bg-slate-800/70" />
          </div>
          <Skeleton className="h-10 w-3/4 bg-slate-800/70" />
          <Skeleton className="h-4 w-1/2 bg-slate-800/70" />
          <Skeleton className="aspect-video w-full rounded-2xl bg-slate-800/70" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-slate-800/70" />
            <Skeleton className="h-4 w-full bg-slate-800/70" />
            <Skeleton className="h-4 w-5/6 bg-slate-800/70" />
            <Skeleton className="h-4 w-full bg-slate-800/70" />
            <Skeleton className="h-4 w-4/5 bg-slate-800/70" />
            <Skeleton className="h-4 w-full bg-slate-800/70" />
            <Skeleton className="h-4 w-3/4 bg-slate-800/70" />
          </div>
        </div>
      </div>
    </main>
  );
}
