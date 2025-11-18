"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

type OrderStatus = "pending" | "paid" | "completed" | "cancelled";
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

export default function OrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [status, setStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const order = useQuery(
    api.orders.getOrderById,
    orderId
      ? {
          orderId: orderId as Id<"orders">,
        }
      : "skip"
  ) as AdminOrder | null | undefined;

  const updateOrderMutation = useMutation(api.orders.updateOrder);
  const deleteOrderMutation = useMutation(api.orders.deleteOrder);

  // Khởi tạo form khi order load
  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.notes || "");
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;

    setIsLoading(true);
    try {
      await updateOrderMutation({
        orderId: order._id,
        status: status as OrderStatus,
        notes: notes.trim(),
      });
      toast.success("Cập nhật đơn hàng thành công");
    } catch (error) {
      toast.error("Lỗi khi cập nhật đơn hàng");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;

    setIsLoading(true);
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
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const isModified = order && (status !== order.status || notes !== (order.notes || ""));
  const isFormValid = status !== "";

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
              {!order ? "Đang tải..." : `Đơn ${order._id.slice(-6).toUpperCase()}`}
            </h1>
            {order && (
              <p className="mt-1 text-sm text-muted-foreground">
                Tạo lúc {formatDate(order.createdAt)} • {ORDER_STATUS_LABELS[order.status]}
              </p>
            )}
          </div>
        </div>
        {order && (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Xóa
          </Button>
        )}
      </div>

      {!order && (
        <div className="flex items-center justify-center gap-2 p-12">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-muted-foreground">Đang tải thông tin đơn hàng...</span>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin học viên</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tên</p>
                  <p className="font-medium">{order.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.studentEmail || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SĐT</p>
                  <p className="font-medium">{order.studentPhone || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin khóa học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tên khóa học</p>
                  <p className="font-medium">{order.courseTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-medium">{order.courseSlug || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá tiền</p>
                  <p className="font-medium">{currencyFormatter.format(order.amount)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cập nhật đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái đơn hàng</label>
                <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="completed">Đã kích hoạt</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                {status && (
                  <Badge className={cn("w-fit text-xs mt-2", ORDER_STATUS_STYLES[status as OrderStatus])}>
                    {ORDER_STATUS_LABELS[status as OrderStatus]}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">Ghi chú nội bộ</label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thêm ghi chú cho đơn hàng này..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !isFormValid || !isModified}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
                <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>


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
          <div className="my-4 space-y-2 rounded-lg bg-muted p-3 text-sm">
            <p><span className="font-medium">Học viên:</span> {order?.studentName}</p>
            <p><span className="font-medium">Khóa học:</span> {order?.courseTitle}</p>
            <p><span className="font-medium">Giá:</span> {order && currencyFormatter.format(order.amount)}</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(value?: number) {
  if (!value) {
    return "—";
  }
  return dateFormatter.format(new Date(value));
}
