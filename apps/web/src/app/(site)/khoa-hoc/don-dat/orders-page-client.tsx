'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "convex/react";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { api } from "@dohy/backend/convex/_generated/api";
import { useCustomerAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Clock, Loader2, Receipt, ArrowRight } from "lucide-react";

type OrderStatus = "pending" | "paid" | "activated" | "cancelled";

type OrderDoc = {
  _id: Id<"orders">;
  orderNumber?: string | null;
  totalAmount?: number | null;
  amount?: number | null;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};

type PurchaseRecord = {
  _id: Id<"customer_purchases">;
  orderId: Id<"orders">;
  productType: "course" | "resource" | "vfx";
  productId: string;
  product?: {
    title?: string;
    slug?: string;
    thumbnailMediaId?: Id<"media">;
  } | null;
};

type OrdersPageClientProps = {
  highlightOrderId?: string;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; tone: string; description: string }> = {
  pending: {
    label: "Chờ xác nhận",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
    description: "Đơn vừa được đặt, chờ admin xác nhận thanh toán.",
  },
  paid: {
    label: "Đã xác nhận",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    description: "Thanh toán đã được ghi nhận, chờ hệ thống kích hoạt.",
  },
  activated: {
    label: "Đã kích hoạt",
    tone: "border-emerald-300 bg-emerald-50 text-emerald-900",
    description: "Bạn đã có thể vào học ngay.",
  },
  cancelled: {
    label: "Đã hủy",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
    description: "Đơn bị hủy. Hãy liên hệ hỗ trợ nếu cần mở lại.",
  },
};

export default function OrdersPageClient({ highlightOrderId }: OrdersPageClientProps) {
  const { customer, status } = useCustomerAuth();

  const orders = useQuery(
    api.orders.getCustomerOrders,
    customer ? { customerId: customer._id as any } : "skip",
  ) as OrderDoc[] | undefined;

  const purchases = useQuery(
    api.purchases.getCustomerLibrary,
    customer ? { customerId: customer._id as any } : "skip",
  ) as PurchaseRecord[] | null | undefined;

  const [pinnedOrderId, setPinnedOrderId] = useState<string | null>(highlightOrderId ?? null);

  useEffect(() => {
    if (!highlightOrderId) return;
    setPinnedOrderId(highlightOrderId);
    const timer = window.setTimeout(() => setPinnedOrderId(null), 6000);
    return () => window.clearTimeout(timer);
  }, [highlightOrderId]);

  const orderWithItems = useMemo(() => {
    const purchaseList = purchases ?? [];
    return (orders ?? []).map((order) => ({
      order,
      items: purchaseList.filter((p) => p.orderId === order._id),
    }));
  }, [orders, purchases]);

  if (status === "loading") {
    return (
      <Card className="flex items-center justify-center gap-3 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Đang tải đơn đặt...</span>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Vui lòng đăng nhập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Bạn cần đăng nhập để xem các đơn đã đặt.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href={`/login?next=${encodeURIComponent("/khoa-hoc/don-dat")}`}>Đăng nhập</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/register?next=${encodeURIComponent("/khoa-hoc/don-dat")}`}>Tạo tài khoản</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || !purchases) {
    return (
      <Card className="flex items-center justify-center gap-3 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Đang tải đơn đặt...</span>
      </Card>
    );
  }

  const pinnedOrder = orderWithItems.find((item) => item.order._id === pinnedOrderId);

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-2xl font-semibold leading-tight">Đơn đặt hàng</h1>

      <Card className="border-dashed border-blue-200 bg-blue-50/60">
        <CardContent className="pt-3 pb-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {["Xác nhận đặt hàng", "Hệ thống kích hoạt", "Vào học / tải xuống"].map((label, index) => (
              <div key={label} className="flex items-start gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-sm shrink-0">
                  {index + 1}
                </div>
                <p className="text-xs text-blue-900 leading-tight pt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pinnedOrder ? (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertTitle>Đơn mới đã ghi nhận</AlertTitle>
          <AlertDescription>
            Đơn {shortId(pinnedOrder.order._id)} đang ở trạng thái{" "}
            {ORDER_STATUS_LABELS[pinnedOrder.order.status].label.toLowerCase()}.
          </AlertDescription>
        </Alert>
      ) : null}

      {orderWithItems.length === 0 ? (
        <Card className="mx-auto max-w-2xl text-center">
          <CardContent className="space-y-4 py-10">
            <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-base font-semibold">Bạn chưa có đơn nào</p>
            <p className="text-sm text-muted-foreground">Khám phá sản phẩm và đặt mua để kích hoạt ngay.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/khoa-hoc">
                  Khóa học
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/thu-vien">Tài nguyên</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderWithItems.map(({ order, items }) => (
            <OrderCard key={order._id} order={order} items={items} highlighted={order._id === pinnedOrderId} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  items,
  highlighted,
}: {
  order: OrderDoc;
  items: PurchaseRecord[];
  highlighted: boolean;
}) {
  const orderStatus = ORDER_STATUS_LABELS[order.status];
  const statusStepMap: Record<OrderStatus, number> = {
    pending: 0,
    paid: 1,
    activated: 2,
    cancelled: -1,
  };
  const currentStepIndex = statusStepMap[order.status];

  const primaryItem = items[0];
  const title =
    primaryItem?.product?.title ||
    (primaryItem?.productType === "course" ? "Khóa học" : primaryItem?.productType === "resource" ? "Tài nguyên" : "VFX");

  const detailLink: Route | null =
    primaryItem?.productType === "course" && primaryItem?.product?.slug
      ? (`/khoa-hoc/${primaryItem.product.slug}` as Route)
      : primaryItem?.productType === "resource"
        ? ("/my-library" as Route)
        : primaryItem?.productType === "vfx"
          ? ("/my-library" as Route)
          : null;

  return (
    <Card className={cn("border border-border/60 shadow-sm", highlighted && "border-primary shadow-lg")}>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">Mã đơn: {order.orderNumber || shortId(order._id)}</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {currencyFormatter.format(getOrderAmount(order))}
            </p>
          </div>
          <Badge className={cn("text-xs shrink-0", orderStatus.tone)}>{orderStatus.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Đặt: {dateTimeFormatter.format(new Date(order.createdAt))}</span>
          <span>Cập nhật: {dateTimeFormatter.format(new Date(order.updatedAt))}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.status === "cancelled" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Đơn đã hủy</AlertTitle>
            <AlertDescription>Liên hệ hỗ trợ nếu bạn cần kích hoạt lại đơn này.</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
            <OrderProgress currentStepIndex={currentStepIndex} />
            <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed">
              <p className="font-semibold text-foreground text-sm">{orderStatus.label}</p>
              <p className="text-muted-foreground">{orderStatus.description}</p>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30">
            <p className="font-semibold text-foreground text-sm mb-2">Sản phẩm trong đơn</p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between gap-3">
                  <span className="font-medium text-foreground">
                    {item.product?.title || item.productId}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                    {item.productType}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {detailLink ? (
            <Button asChild size="sm">
              <Link href={detailLink}>{order.status === "activated" ? "Vào học / tải xuống" : "Xem chi tiết"}</Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              Xem chi tiết
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/khoa-hoc">Khóa khác</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderProgress({ currentStepIndex }: { currentStepIndex: number }) {
  const steps = [
    { label: "Đặt đơn", desc: "Bạn xác nhận mua" },
    { label: "Chờ xác nhận", desc: "Admin xác nhận" },
    { label: "Vào học", desc: "Truy cập khóa" },
  ];

  return (
    <div className="space-y-2 rounded-lg border bg-background p-3">
      {steps.map((step, index) => {
        const reached = currentStepIndex >= index;
        const Icon = reached ? CheckCircle : Clock;
        return (
          <div key={step.label} className="flex gap-2 items-start">
            <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", reached ? "text-emerald-600" : "text-muted-foreground")} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight">{step.label}</p>
              <p className="text-xs text-muted-foreground leading-tight">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getOrderAmount(order: Pick<OrderDoc, "totalAmount" | "amount">) {
  return order.totalAmount ?? order.amount ?? 0;
}

function shortId(value: string) {
  return value.slice(-6).toUpperCase();
}
