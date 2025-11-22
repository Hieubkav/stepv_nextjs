"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock3,
  Coins,
  Pencil,
  Trash2,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
} from "lucide-react";

type OrderStatus = "pending" | "paid" | "activated" | "cancelled";
type StatusFilter = "all" | OrderStatus;

type AdminOrder = {
  _id: Id<"orders">;
  studentId: Id<"students">;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  courseId: Id<"courses">;
  courseTitle: string;
  courseSlug?: string;
  totalAmount?: number;
  amount?: number;
  status: OrderStatus;
  paymentMethod: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
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
  activated: "Đã kích hoạt",
  cancelled: "Đã hủy",
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  paid: "border-sky-200 bg-sky-50 text-sky-800",
  activated: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-slate-200 bg-slate-50 text-slate-700",
};

const SUCCESS_STATUS_FOR_STATS: OrderStatus[] = ["paid", "activated"];

const ORDERS_FETCH_LIMIT = 200;

export default function OrdersResourcePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<AdminOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOrderMutation = useMutation(api.orders.deleteOrder);

  const orders = useQuery(api.orders.listOrders, {
    limit: ORDERS_FETCH_LIMIT,
  }) as AdminOrder[] | undefined;

  const searchTerm = search.trim().toLowerCase();

  const stats = useMemo(() => {
    const data = orders ?? [];
    const total = data.length;
    const pending = data.filter((order) => order.status === "pending").length;
    const successful = data.filter((order) => SUCCESS_STATUS_FOR_STATS.includes(order.status)).length;
    const revenue = data
      .filter((order) => SUCCESS_STATUS_FOR_STATS.includes(order.status))
      .reduce((sum, order) => sum + getOrderAmount(order), 0);

    return { total, pending, successful, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) {
      return [];
    }

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
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
  }, [orders, statusFilter, searchTerm]);

  const isLoading = orders === undefined;
  const hasOrders = !isLoading && orders && orders.length > 0;

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await deleteOrderMutation({
        orderId: deleteConfirm._id,
      });
      toast.success("Xóa đơn hàng thành công");
      setDeleteConfirm(null);
      router.refresh();
    } catch (error) {
      toast.error("Lỗi khi xóa đơn hàng");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng khóa học</h1>
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
          title="Đang chờ"
          value={stats.pending.toLocaleString("vi-VN")}
          description="Bao gồm tất cả đơn chưa xác nhận thanh toán"
          icon={Clock3}
        />
        <StatCard
          title="Đơn thành công"
          value={stats.successful.toLocaleString("vi-VN")}
          description="Đã thanh toán hoặc đã kích hoạt"
          icon={BadgeCheck}
        />
        <StatCard
          title="Doanh thu tạm tính"
          value={currencyFormatter.format(stats.revenue)}
          description="Tính cho đơn đã thanh toán/kích hoạt/hoàn tất"
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
                  <SelectItem value="activated">Đã kích hoạt</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <div className="hidden grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_auto] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>Học viên</span>
              <span>Khóa học</span>
              <span>Tổng tiền</span>
              <span>Đơn hàng</span>
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
                    className="flex flex-col gap-4 px-4 py-4 text-sm md:grid md:grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_auto] md:items-center md:gap-3"
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
                      {currencyFormatter.format(getOrderAmount(order))}
                      <p className="text-xs font-normal text-muted-foreground">{order.paymentMethod}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Badge className={cn("w-fit text-xs", ORDER_STATUS_STYLES[order.status])}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex justify-start gap-2 md:justify-end">
                      <Button 
                        variant="ghost"
                        size="sm"
                        title="Sửa/Xem"
                        onClick={() => router.push(`/dashboard/order/${order._id}/edit`)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        title="Xóa"
                        onClick={() => setDeleteConfirm(order)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteConfirm)} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đơn hàng?</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xóa đơn hàng này? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deleteConfirm && (
            <div className="my-4 space-y-2 rounded-lg bg-muted p-3 text-sm">
              <p><span className="font-medium">Học viên:</span> {deleteConfirm.studentName}</p>
              <p><span className="font-medium">Khóa học:</span> {deleteConfirm.courseTitle}</p>
              <p><span className="font-medium">Giá:</span> {currencyFormatter.format(getOrderAmount(deleteConfirm))}</p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
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

function getOrderAmount(order: Pick<AdminOrder, "totalAmount" | "amount">) {
  return order.totalAmount ?? order.amount ?? 0;
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
