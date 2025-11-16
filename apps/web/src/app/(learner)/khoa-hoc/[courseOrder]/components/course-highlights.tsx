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
    <Card>
      <CardHeader>
        <CardTitle>Thông tin khóa học</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold">Bạn sẽ nhận được</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        {curriculumSummary ? (
          <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Lộ trình gồm {curriculumSummary}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
