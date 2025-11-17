"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Năm nay" },
  { value: "all", label: "Tất cả" },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

type StatsTimelinePoint = {
  label: string;
  from: number;
  to: number;
  visits: number;
};

type VisitorsStats = {
  range: RangeValue;
  totalVisits: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  activeNow: number;
  start: number | null;
  end: number;
  timeline: StatsTimelinePoint[];
};


export function VisitorOverview() {
  const [range, setRange] = useState<RangeValue>("today");
  const stats = useQuery(api.visitors.stats, { range }) as VisitorsStats | undefined;

  const isLoading = stats === undefined;
  const rangeOption = RANGE_OPTIONS.find((option) => option.value === range);
  const timeline = stats?.timeline ?? [];
  const maxVisits = useMemo(
    () => (timeline.length ? Math.max(...timeline.map((point) => point.visits)) : 0),
    [timeline],
  );

  const updatedAt = useMemo(() => {
    if (!stats?.end) return "";
    try {
      return new Date(stats.end).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "";
    }
  }, [stats?.end]);

  const metrics: Array<{
    key: string;
    label: string;
    value: number;
    hint?: string;
    highlight?: boolean;
  }> = [
    {
      key: "totalVisits",
      label: "Lượt truy cập",
      value: stats?.totalVisits ?? 0,
      hint: rangeOption?.label ? `Trong ${rangeOption.label.toLowerCase()}` : undefined,
    },
    {
      key: "uniqueVisitors",
      label: "Khách duy nhất",
      value: stats?.uniqueVisitors ?? 0,
      hint: "Theo visitorId",
    },
    {
      key: "uniqueSessions",
      label: "Số phiên",
      value: stats?.uniqueSessions ?? 0,
      hint: "Tổng số session",
    },
    {
      key: "activeNow",
      label: "Đang online",
      value: stats?.activeNow ?? 0,
      hint: "Trong 5 phút gần nhất",
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Theo dõi visitor</CardTitle>
            <CardDescription>
              Cập nhật {rangeOption?.label?.toLowerCase() ?? "thời gian"}
              {updatedAt ? ` - lần cuối ${updatedAt}` : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={range === option.value ? "default" : "outline"}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatTile
                key={metric.key}
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
                loading={isLoading}
                highlight={metric.highlight}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lượt truy cập theo thời gian</CardTitle>
          <CardDescription>
            {rangeOption?.label ?? "Tất cả"}
            {timeline.length === 0 && !isLoading ? " - không có dữ liệu" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TimelineSkeleton />
          ) : timeline.length ? (
            <div className="space-y-3">
              {timeline.map((point) => {
                const widthPercent =
                  maxVisits > 0
                    ? Math.min(
                        100,
                        Math.max((point.visits / maxVisits) * 100, point.visits > 0 ? 8 : 0),
                      )
                    : 0;
                return (
                  <div key={`${point.from}-${point.label}`} className="flex items-center gap-3">
                    <div className="w-20 text-xs font-medium text-muted-foreground">{point.label}</div>
                    <div className="flex h-2 flex-1 rounded bg-muted">
                      <div
                        className="h-2 rounded bg-primary transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-semibold text-foreground">
                      {formatNumber(point.visits)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  highlight,
  loading,
}: {
  label: string;
  value: number;
  hint?: string;
  highlight?: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-3 h-8 w-16" />
        <Skeleton className="mt-3 h-3 w-24" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={cn("text-3xl font-semibold", highlight ? "text-primary" : undefined)}>
          {formatNumber(value)}
        </span>
        {highlight ? <Badge variant="outline">Live</Badge> : null}
      </div>
      {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 flex-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
      Chưa có lượt truy cập nào cho bộ lọc này.
    </div>
  );
}

function formatNumber(input: number) {
  return new Intl.NumberFormat("vi-VN").format(input ?? 0);
}

