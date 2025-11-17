"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Clock3,
  Coins,
  CreditCard,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
} from "lucide-react";

type OrderStatus = "pending" | "paid" | "completed" | "cancelled";
type PaymentStatus = "pending" | "confirmed" | "rejected";
type StatusFilter = "all" | OrderStatus;
type PaymentFilter = "all" | PaymentStatus | "none";

type AdminOrder = {
  _id: Id<"orders">;
  studentId: Id<"students">;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  courseId: Id<"courses">;
  courseTitle: string;
  courseSlug?: string;
  amount: number;
  status: OrderStatus;
  paymentMethod: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  paymentStatus?: PaymentStatus;
  paymentId?: Id<"payments">;
  paymentRecordedAt?: number;
  paymentScreenshotUrl?: string;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  completed: "Đã kích hoạt",
  cancelled: "Đã hủy",
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  paid: "border-sky-200 bg-sky-50 text-sky-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-slate-200 bg-slate-50 text-slate-700",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Chờ duyệt",
  confirmed: "Đã xác nhận",
  rejected: "Từ chối",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

const ORDERS_FETCH_LIMIT = 200;

export default function OrdersResourcePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);

  const orders = useQuery(api.orders.listOrders, {
    limit: ORDERS_FETCH_LIMIT,
  }) as AdminOrder[] | undefined;

  const searchTerm = search.trim().toLowerCase();

  const stats = useMemo(() => {
    const data = orders ?? [];
    const total = data.length;
    const pending = data.filter((order) => order.status === "pending").length;
    const confirmed = data.filter((order) => order.status === "paid").length;
    const activated = data.filter((order) => order.status === "completed").length;
    const revenue = data
      .filter((order) => order.status === "paid" || order.status === "completed")
      .reduce((sum, order) => sum + order.amount, 0);

    return { total, pending, confirmed, activated, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) {
      return [];
    }

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      if (paymentFilter === "none") {
        if (order.paymentStatus) {
          return false;
        }
      } else if (paymentFilter !== "all") {
        if (order.paymentStatus !== paymentFilter) {
          return false;
        }
      }

      if (!searchTerm) {
        return true;
      }

      const haystack = [
        order.studentName,
        order.studentEmail,
        order.studentPhone,
        order.courseTitle,
        order.courseSlug,
        order._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchTerm);
    });
  }, [orders, statusFilter, paymentFilter, searchTerm]);

  const isLoading = orders === undefined;
  const hasOrders = !isLoading && orders && orders.length > 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng khóa học</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resource kiểu Filament 4.x cho phép xem nhanh đơn học viên đặt mua, lọc trạng thái và mở chi
            tiết ngay trên dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.refresh()} className="gap-2">
            <RefreshCw className="size-4" />
            Tải lại
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng số đơn"
          value={stats.total.toLocaleString("vi-VN")}
          description={`Hiển thị tối đa ${ORDERS_FETCH_LIMIT} đơn gần nhất`}
          icon={ReceiptText}
        />
        <StatCard
          title="Đang chờ thanh toán"
          value={stats.pending.toLocaleString("vi-VN")}
          description="Đơn vừa khởi tạo và chưa có minh chứng"
          icon={Clock3}
        />
        <StatCard
          title="Đơn đã xác nhận"
          value={(stats.confirmed + stats.activated).toLocaleString("vi-VN")}
          description={`${stats.confirmed.toLocaleString("vi-VN")} chờ kích hoạt, ${stats.activated.toLocaleString("vi-VN")} đã active`}
          icon={BadgeCheck}
        />
        <StatCard
          title="Doanh thu tạm tính"
          value={currencyFormatter.format(stats.revenue)}
          description="Tính cho đơn đã thanh toán/kích hoạt"
          icon={Coins}
        />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo học viên, khóa học, mã đơn..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái đơn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="completed">Đã kích hoạt</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thanh toán</SelectItem>
                  <SelectItem value="none">Chưa có minh chứng</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="rejected">Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <div className="hidden grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_0.9fr_auto] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>Học viên</span>
              <span>Khóa học</span>
              <span>Tổng tiền</span>
              <span>Đơn hàng</span>
              <span>Thanh toán</span>
              <span className="text-right">Thao tác</span>
            </div>
            <div className="divide-y">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải danh sách đơn hàng...
                </div>
              )}

              {!isLoading && filteredOrders.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">
                  {hasOrders
                    ? "Không tìm thấy đơn hàng khớp điều kiện lọc."
                    : "Chưa có đơn hàng nào được ghi nhận."}
                </div>
              )}

              {!isLoading &&
                filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-4 px-4 py-4 text-sm md:grid md:grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_0.9fr_auto] md:items-center md:gap-3"
                  >
                    <div>
                      <p className="font-medium">{order.studentName}</p>
                      <p className="text-xs text-muted-foreground">{order.studentEmail ?? "Chưa có email"}</p>
                      {order.studentPhone && (
                        <p className="text-xs text-muted-foreground">SĐT: {order.studentPhone}</p>
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{order.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.courseSlug ? `/${order.courseSlug}` : "Chưa có slug"}
                      </p>
                    </div>

                    <div className="font-semibold">
                      {currencyFormatter.format(order.amount)}
                      <p className="text-xs font-normal text-muted-foreground">{order.paymentMethod}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Badge className={cn("w-fit text-xs", ORDER_STATUS_STYLES[order.status])}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Badge
                        className={cn(
                          "w-fit text-xs",
                          order.paymentStatus ? PAYMENT_STATUS_STYLES[order.paymentStatus] : "border-slate-200 bg-slate-50 text-slate-700"
                        )}
                      >
                        {order.paymentStatus ? PAYMENT_STATUS_LABELS[order.paymentStatus] : "Chưa ghi nhận"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {order.paymentStatus ? formatDate(order.paymentRecordedAt) : "—"}
                      </p>
                    </div>

                    <div className="flex justify-start md:justify-end">
                      <Button variant="outline" size="sm" onClick={() => setDetailOrder(order)}>
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(detailOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailOrder(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Đơn {shortId(detailOrder._id)}</DialogTitle>
                <DialogDescription>
                  Tạo lúc {formatDate(detailOrder.createdAt)} • {ORDER_STATUS_LABELS[detailOrder.status]}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2">
                  <DetailField label="Trạng thái đơn">
                    <Badge className={cn("text-xs", ORDER_STATUS_STYLES[detailOrder.status])}>
                      {ORDER_STATUS_LABELS[detailOrder.status]}
                    </Badge>
                  </DetailField>
                  <DetailField label="Trạng thái thanh toán">
                    <Badge
                      className={cn(
                        "text-xs",
                        detailOrder.paymentStatus
                          ? PAYMENT_STATUS_STYLES[detailOrder.paymentStatus]
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      )}
                    >
                      {detailOrder.paymentStatus
                        ? PAYMENT_STATUS_LABELS[detailOrder.paymentStatus]
                        : "Chưa ghi nhận"}
                    </Badge>
                  </DetailField>
                  <DetailField label="Tổng tiền">
                    {currencyFormatter.format(detailOrder.amount)}
                  </DetailField>
                  <DetailField label="Phương thức">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-muted-foreground" />
                      <span className="font-medium uppercase tracking-wide">{detailOrder.paymentMethod}</span>
                    </div>
                  </DetailField>
                  <DetailField label="Mã đơn">
                    <code className="rounded bg-muted px-2 py-1 text-xs">{detailOrder._id}</code>
                  </DetailField>
                  <DetailField label="Cập nhật lần cuối">
                    {formatDate(detailOrder.updatedAt)}
                  </DetailField>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <DetailField label="Học viên">
                    <div>
                      <p className="font-medium">{detailOrder.studentName}</p>
                      <p className="text-sm text-muted-foreground">{detailOrder.studentEmail ?? "Chưa có email"}</p>
                      {detailOrder.studentPhone && (
                        <p className="text-sm text-muted-foreground">SĐT: {detailOrder.studentPhone}</p>
                      )}
                    </div>
                  </DetailField>
                  <DetailField label="Khóa học">
                    <div>
                      <p className="font-medium">{detailOrder.courseTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {detailOrder.courseSlug ? `/${detailOrder.courseSlug}` : "Không có slug"}
                      </p>
                    </div>
                  </DetailField>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <DetailField label="Mã thanh toán">
                    {detailOrder.paymentId ? (
                      <code className="rounded bg-muted px-2 py-1 text-xs">{detailOrder.paymentId}</code>
                    ) : (
                      "Chưa ghi nhận"
                    )}
                  </DetailField>
                  <DetailField label="Thời điểm ghi nhận">
                    {detailOrder.paymentStatus ? formatDate(detailOrder.paymentRecordedAt) : "—"}
                  </DetailField>
                  <DetailField label="Minh chứng">
                    {detailOrder.paymentScreenshotUrl ? (
                      <a
                        href={detailOrder.paymentScreenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Mở ảnh/video
                      </a>
                    ) : (
                      "Không có"
                    )}
                  </DetailField>
                  <DetailField label="Ghi chú nội bộ">
                    {detailOrder.notes ?? "Không có"}
                  </DetailField>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <Icon className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function shortId(id: string) {
  return id.slice(-6).toUpperCase();
}

function formatDate(value?: number) {
  if (!value) {
    return "—";
  }
  return dateFormatter.format(new Date(value));
}
