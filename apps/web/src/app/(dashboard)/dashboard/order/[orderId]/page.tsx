"use client";

import { useQuery, useMutation } from "convex/react";
import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type OrderStatus = "pending" | "paid" | "activated" | "cancelled";
type PaymentStatus = "pending" | "confirmed" | "rejected";

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
  activated: "Đã kích hoạt",
  cancelled: "Đã hủy",
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  paid: "border-sky-200 bg-sky-50 text-sky-800",
  activated: "border-emerald-200 bg-emerald-50 text-emerald-800",
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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const order = useQuery(
    api.orders.getOrderById,
    orderId
      ? {
          orderId: orderId as Id<"orders">,
        }
      : "skip"
  ) as AdminOrder | null | undefined;

  const deleteOrderMutation = useMutation(api.orders.deleteOrder);

  const isLoading = order === undefined;

  const handleDelete = async () => {
    if (!order) return;

    setIsDeleting(true);
    try {
      await deleteOrderMutation({
        orderId: order._id,
      });
      toast.success("Xóa đơn hàng thành công");
      router.push("/dashboard/order");
    } catch (error) {
      toast.error("Lỗi khi xóa đơn hàng");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isLoading ? "Đang tải..." : order ? `Đơn ${shortId(order._id)}` : "Không tìm thấy đơn hàng"}
            </h1>
            {order && (
              <p className="mt-1 text-sm text-muted-foreground">
                Tạo lúc {formatDate(order.createdAt)} • {ORDER_STATUS_LABELS[order.status]}
              </p>
            )}
          </div>
        </div>
        {order && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/order/${order._id}/edit`)}
              className="gap-2"
            >
              <Pencil className="size-4" />
              Sửa
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="size-4" />
              Xóa
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 p-12">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-muted-foreground">Đang tải thông tin đơn hàng...</span>
        </div>
      )}

      {!isLoading && !order && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">Không tìm thấy đơn hàng. Vui lòng quay lại danh sách.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && order && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard label="Trạng thái đơn">
              <Badge className={cn("text-xs", ORDER_STATUS_STYLES[order.status])}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </DetailCard>
            <DetailCard label="Trạng thái thanh toán">
              <Badge
                className={cn(
                  "text-xs",
                  order.paymentStatus
                    ? PAYMENT_STATUS_STYLES[order.paymentStatus]
                    : "border-slate-200 bg-slate-50 text-slate-700"
                )}
              >
                {order.paymentStatus
                  ? PAYMENT_STATUS_LABELS[order.paymentStatus]
                  : "Chưa ghi nhận"}
              </Badge>
            </DetailCard>
            <DetailCard label="Tổng tiền">
              {currencyFormatter.format(getOrderAmount(order))}
            </DetailCard>
            <DetailCard label="Phương thức">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <span className="font-medium uppercase tracking-wide">{order.paymentMethod}</span>
              </div>
            </DetailCard>
            <DetailCard label="Mã đơn">
              <code className="rounded bg-muted px-2 py-1 text-xs">{order._id}</code>
            </DetailCard>
            <DetailCard label="Cập nhật lần cuối">
              {formatDate(order.updatedAt)}
            </DetailCard>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard label="Học viên">
              <div>
                <p className="font-medium">{order.studentName}</p>
                <p className="text-sm text-muted-foreground">{order.studentEmail ?? "Chưa có email"}</p>
                {order.studentPhone && (
                  <p className="text-sm text-muted-foreground">SĐT: {order.studentPhone}</p>
                )}
              </div>
            </DetailCard>
            <DetailCard label="Khóa học">
              <div>
                <p className="font-medium">{order.courseTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {order.courseSlug ? `/${order.courseSlug}` : "Không có slug"}
                </p>
              </div>
            </DetailCard>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard label="Mã thanh toán">
              {order.paymentId ? (
                <code className="rounded bg-muted px-2 py-1 text-xs">{order.paymentId}</code>
              ) : (
                "Chưa ghi nhận"
              )}
            </DetailCard>
            <DetailCard label="Thời điểm ghi nhận">
              {order.paymentStatus ? formatDate(order.paymentRecordedAt) : "—"}
            </DetailCard>
            <DetailCard label="Minh chứng">
              {order.paymentScreenshotUrl ? (
                <a
                  href={order.paymentScreenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Mở ảnh/video
                </a>
              ) : (
                "Không có"
              )}
            </DetailCard>
            <DetailCard label="Ghi chú nội bộ">
              {order.notes ?? "Không có"}
            </DetailCard>
          </div>
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đơn hàng?</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xóa đơn hàng này? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {order && (
            <div className="my-4 space-y-2 rounded-lg bg-muted p-3 text-sm">
              <p><span className="font-medium">Học viên:</span> {order.studentName}</p>
              <p><span className="font-medium">Khóa học:</span> {order.courseTitle}</p>
              <p><span className="font-medium">Giá:</span> {currencyFormatter.format(getOrderAmount(order))}</p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
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

function DetailCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{children}</div>
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
