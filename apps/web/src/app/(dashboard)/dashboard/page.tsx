export const dynamic = "force-dynamic";

import { VisitorOverview } from "./visitor-overview";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bang dieu khien</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tong quan truy cap thoi gian thuc va cac chi so visitor chinh.
        </p>
      </div>

      <VisitorOverview />

      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Du lieu visitor duoc cap nhat tu he thong theo doi noi bo (heartbeat 60s).
        </CardContent>
      </Card>
    </div>
  );
}