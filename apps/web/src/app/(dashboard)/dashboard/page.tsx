export const dynamic = "force-dynamic";

import { VisitorOverview } from "./visitor-overview";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng quan truy cập thời gian thực và các chỉ số visitor chính.
        </p>
      </div>

      <VisitorOverview />

      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Dữ liệu visitor được cập nhật từ hệ thống theo dõi nội bộ (heartbeat 60s).
        </CardContent>
      </Card>
    </div>
  );
}