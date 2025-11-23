import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CourseHighlights({ 
  stats, 
  features, 
  curriculumSummary 
}: { 
  stats: Array<{ label: string; value: string }>;
  features: string[];
  curriculumSummary: string;
}) {
  return (
    <Card className="border border-slate-800/70 bg-[#050914] text-slate-200 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
      <CardHeader>
        <CardTitle className="text-white">Thông tin khóa học</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-4 text-center shadow-inner shadow-black/20"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Bạn sẽ nhận được</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        {curriculumSummary ? (
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-300">
            Lộ trình gồm {curriculumSummary}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
