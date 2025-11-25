'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "convex/react";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { api } from "@dohy/backend/convex/_generated/api";
import { useCustomerAuth } from "@/features/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MediaDoc } from "@/features/vfx/types";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  XCircle,
} from "lucide-react";

type OrderStatus = "pending" | "paid" | "activated" | "cancelled";

type ProductSummary = {
  title?: string | null;
  slug?: string | null;
  thumbnailMediaId?: Id<"media">;
  coverImageId?: Id<"media">;
  thumbnailId?: Id<"media">;
};

type OrderItem = {
  _id: Id<"order_items">;
  orderId: Id<"orders">;
  productType: "course" | "resource" | "vfx";
  productId: string;
  price: number;
  createdAt: number;
  product?: ProductSummary | null;
};

type OrderDoc = {
  _id: Id<"orders">;
  orderNumber?: string | null;
  totalAmount?: number | null;
  amount?: number | null;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};

type OrderWithItems = OrderDoc & { items: OrderItem[] };

type OrdersPageClientProps = {
  highlightOrderId?: string;
};

type StatusConfig = {
  label: string;
  badgeClass: string;
  glowClass: string;
  step: number;
  messageTitle: string;
  messageDesc: string;
  icon: typeof Clock3;
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

const TRACKING_STEPS = [
  { id: 1, label: "Xác nhận đặt hàng" },
  { id: 2, label: "Kích hoạt truy cập" },
  { id: 3, label: "Vào học / tải xuống" },
];

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Đang xử lý",
    badgeClass: "bg-amber-400/15 text-amber-50 ring-1 ring-amber-300/40",
    glowClass: "border-amber-300/50 bg-amber-500/10 text-amber-100",
    step: 1,
    messageTitle: "Chờ xác nhận thanh toán",
    messageDesc: "Chúng tôi đã nhận đơn và đang kiểm tra giao dịch của bạn.",
    icon: Clock3,
  },
  paid: {
    label: "Đã xác nhận",
    badgeClass: "bg-emerald-400/15 text-emerald-50 ring-1 ring-emerald-300/40",
    glowClass: "border-emerald-300/50 bg-emerald-500/10 text-emerald-100",
    step: 2,
    messageTitle: "Đang kích hoạt quyền truy cập",
    messageDesc: "Thanh toán hợp lệ. Quyền truy cập đang được mở tự động.",
    icon: ShieldCheck,
  },
  activated: {
    label: "Hoàn tất",
    badgeClass: "bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/40",
    glowClass: "border-emerald-300/60 bg-emerald-500/10 text-emerald-100",
    step: 3,
    messageTitle: "Đơn đã hoàn tất",
    messageDesc: "Bạn có thể vào học hoặc tải tài nguyên ngay bây giờ.",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Đã hủy",
    badgeClass: "bg-rose-500/15 text-rose-50 ring-1 ring-rose-300/40",
    glowClass: "border-rose-300/60 bg-rose-500/15 text-rose-100",
    step: 1,
    messageTitle: "Đơn đã hủy",
    messageDesc: "Liên hệ hỗ trợ nếu bạn muốn mở lại hoặc có thắc mắc.",
    icon: XCircle,
  },
};

export default function OrdersPageClient({ highlightOrderId }: OrdersPageClientProps) {
  const { customer, status } = useCustomerAuth();

  const orders = useQuery(
    api.orders.getCustomerOrdersWithItems,
    customer ? { customerId: customer._id as any } : "skip",
  ) as OrderWithItems[] | undefined;

  const images = useQuery(api.media.list, { kind: "image" }) as MediaDoc[] | undefined;

  const mediaMap = useMemo(() => {
    const map = new Map<string, MediaDoc>();
    if (Array.isArray(images)) {
      images.forEach((m) => map.set(String(m._id), m));
    }
    return map;
  }, [images]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pinnedOrderId, setPinnedOrderId] = useState<string | null>(highlightOrderId ?? null);
  const [hasInitExpanded, setHasInitExpanded] = useState(false);

  useEffect(() => {
    if (!highlightOrderId) return;
    setPinnedOrderId(highlightOrderId);
    const timer = window.setTimeout(() => setPinnedOrderId(null), 6000);
    return () => window.clearTimeout(timer);
  }, [highlightOrderId]);

  useEffect(() => {
    if (hasInitExpanded) return;
    if (!orders || orders.length === 0) return;
    const preferred =
      (highlightOrderId && orders.find((o) => o._id === highlightOrderId)?._id) ?? orders[0]._id;
    setExpandedId(preferred);
    setHasInitExpanded(true);
  }, [orders, highlightOrderId, hasInitExpanded]);

  if (status === "loading") {
    return (
      <PageShell>
        <LoadingBlock />
      </PageShell>
    );
  }

  if (!customer) {
    return (
      <PageShell>
        <LoginRequest />
      </PageShell>
    );
  }

  if (orders === undefined) {
    return (
      <PageShell>
        <LoadingBlock />
      </PageShell>
    );
  }

  const orderList = [...(orders ?? [])].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <PageShell>
      <PageHeader orderCount={orderList.length} />

      {pinnedOrderId ? <PinnedBanner orderId={pinnedOrderId} /> : null}

      {orderList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-5 md:space-y-6">
          {orderList.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              items={order.items}
              mediaMap={mediaMap}
              expanded={expandedId === order._id}
              highlighted={pinnedOrderId === order._id}
              onToggle={() => setExpandedId((prev) => (prev === order._id ? null : order._id))}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050915] via-[#071026] to-[#02050d] text-slate-100">
      <div className="relative mx-auto max-w-5xl px-3 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 md:pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_center,#fbbf2426,transparent_60%)] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-20 h-64 bg-[radial-gradient(circle_at_center,#22d3ee1a,transparent_65%)] blur-3xl" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

function PageHeader({ orderCount }: { orderCount: number }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4 sm:mb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/khoa-hoc"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-amber-300/40 hover:text-amber-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80">Dohy Studio</p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Đơn hàng của tôi</h1>
          <p className="text-sm text-slate-400">
            Quản lý, theo dõi tiến trình kích hoạt và mở nội dung đã mua.
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:flex">
        <ShoppingBag className="h-4 w-4 text-amber-200" />
        <span>{orderCount} đơn</span>
      </div>
    </div>
  );
}

function PinnedBanner({ orderId }: { orderId: string }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-50 shadow-[0_10px_40px_rgba(251,191,36,0.18)] backdrop-blur">
      <Sparkles className="h-4 w-4" />
      <div className="flex-1">
        <p className="font-semibold">
          Đơn mới <span className="font-mono">#{shortId(orderId)}</span> đã được ghi nhận
        </p>
        <p className="text-amber-100/80">Hệ thống đang cập nhật trạng thái cho bạn.</p>
      </div>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center text-slate-300">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
        <Clock3 className="h-5 w-5 animate-spin text-amber-200" />
      </div>
      <p className="text-sm">Đang tải đơn đặt...</p>
    </div>
  );
}

function LoginRequest() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-100">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-semibold text-white">Vui lòng đăng nhập</h2>
      <p className="mt-2 text-sm text-slate-400">Bạn cần đăng nhập để xem các đơn đã đặt.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="bg-amber-400 text-slate-950 hover:brightness-110">
          <Link href={`/login?next=${encodeURIComponent("/don-dat")}`}>Đăng nhập</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-slate-600 bg-transparent text-slate-100 hover:bg-slate-900"
        >
          <Link href={`/register?next=${encodeURIComponent("/don-dat")}`}>Tạo tài khoản</Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0d1428] via-[#0d1224] to-[#090f20] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
      <div className="flex items-start gap-4">
        <div className="mt-1 rounded-xl bg-amber-400/20 p-3 text-amber-50">
          <Receipt className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">Bạn chưa có đơn nào</h3>
          <p className="text-sm text-slate-400">
            Khám phá kho sản phẩm và đặt mua để kích hoạt quyền truy cập ngay.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="bg-amber-400 text-slate-950 hover:brightness-110"
              size="sm"
            >
              <Link href="/khoa-hoc">Khóa học</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
            >
              <Link href="/thu-vien">Thư viện</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
            >
              <Link href="/vfx">VFX</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  items,
  mediaMap,
  expanded,
  highlighted,
  onToggle,
}: {
  order: OrderWithItems;
  items: OrderItem[];
  mediaMap: Map<string, MediaDoc>;
  expanded: boolean;
  highlighted: boolean;
  onToggle: () => void;
}) {
  const config = STATUS_CONFIG[order.status];
  const createdAt = dateTimeFormatter.format(new Date(order.createdAt));
  const amount = currencyFormatter.format(getOrderAmount(order));
  const orderCode = order.orderNumber || shortId(order._id);

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-lg transition-all duration-300",
        expanded
          ? "border-amber-300/50 shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
          : "hover:-translate-y-0.5 hover:border-amber-300/25",
        highlighted && "ring-2 ring-amber-400/60",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-col gap-4 px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-6"
      >
        <div className="flex flex-1 items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border text-amber-100 shadow-inner",
              config.glowClass,
              order.status === "cancelled" && "border-rose-300/60 bg-rose-500/15 text-rose-100",
            )}
          >
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold leading-tight text-white sm:text-lg">
                {orderCode}
              </p>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                  config.badgeClass,
                )}
              >
                {config.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Đặt {createdAt}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>{items.length} sản phẩm</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Tổng thanh toán</p>
            <p className="text-lg font-semibold text-amber-200 md:text-xl">{amount}</p>
          </div>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition",
              expanded
                ? "rotate-180 bg-amber-400/10 text-amber-100"
                : "group-hover:border-amber-300/40 group-hover:text-amber-200",
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-in-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/5 bg-[#0b1224]/80 px-4 pb-5 pt-4 md:px-6 md:pb-7">
            <OrderTracker currentStep={config.step} isCancelled={order.status === "cancelled"} />
            <StatusNote status={order.status} updatedAt={order.updatedAt} />
            <OrderItems items={items} mediaMap={mediaMap} status={order.status} />
            {order.status === "activated" ? (
              <div className="mt-4 flex flex-wrap gap-3 border-t border-white/5 pt-4">
                <Button
                  asChild
                  size="sm"
                  className="bg-amber-400 text-slate-950 hover:brightness-110"
                >
                  <Link href="/my-library">Mở thư viện</Link>
                </Button>
                <button className="inline-flex items-center gap-2 text-sm text-amber-200 hover:text-amber-100">
                  <FileText className="h-4 w-4" />
                  Tải hóa đơn (sắp ra mắt)
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTracker({ currentStep, isCancelled }: { currentStep: number; isCancelled: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-4">
      <div className="flex items-center justify-between gap-2">
        {TRACKING_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const reached = currentStep > stepNumber;
          const active = currentStep === stepNumber;
          const circleState = isCancelled
            ? "border-rose-300/70 bg-rose-500/10 text-rose-100"
            : reached
              ? "border-amber-400 bg-amber-400 text-slate-950"
              : active
                ? "border-amber-300/60 text-amber-100"
                : "border-slate-700 text-slate-500";

          return (
            <div key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    circleState,
                  )}
                >
                  {reached && !isCancelled ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
                </div>
                <p
                  className={cn(
                    "text-center text-[11px] uppercase leading-tight tracking-wide",
                    reached || active ? "text-amber-100" : "text-slate-500",
                  )}
                >
                  {step.label}
                </p>
              </div>
              {index < TRACKING_STEPS.length - 1 ? (
                <div className="flex-1">
                  <div className="h-[2px] overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 ease-in-out",
                        reached && !isCancelled ? "w-full bg-amber-400" : "w-0",
                      )}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusNote({ status, updatedAt }: { status: OrderStatus; updatedAt: number }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="mt-4 flex gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
      <div
        className={cn(
          "mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10",
          status === "cancelled" ? "bg-rose-500/15 text-rose-100" : "bg-amber-400/15 text-amber-100",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-semibold text-white">{config.messageTitle}</p>
        <p className="text-slate-300">{config.messageDesc}</p>
        <p className="text-xs text-slate-500">
          Cập nhật: {dateTimeFormatter.format(new Date(updatedAt))}
        </p>
      </div>
    </div>
  );
}

function OrderItems({
  items,
  mediaMap,
  status,
}: {
  items: OrderItem[];
  mediaMap: Map<string, MediaDoc>;
  status: OrderStatus;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-slate-400">
        <span>Chi tiết đơn hàng</span>
        {status !== "cancelled" ? <span className="text-amber-100">Digital</span> : null}
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <OrderItemCard key={item._id} item={item} mediaMap={mediaMap} status={status} />
        ))}
      </div>
    </div>
  );
}

function OrderItemCard({
  item,
  mediaMap,
  status,
}: {
  item: OrderItem;
  mediaMap: Map<string, MediaDoc>;
  status: OrderStatus;
}) {
  const link = productLink(item);
  const name = item.product?.title ?? fallbackTitle(item.productType, item.productId);
  const thumbUrl = getThumbUrl(item, mediaMap);
  const typeLabel = productTypeLabel(item.productType);
  const action = actionLabel(item.productType, status);
  const priceLabel = currencyFormatter.format(item.price);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-[#0f172a] sm:w-48">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-wide text-slate-500">
            Không có ảnh
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-base font-semibold text-white">{name}</p>
            <p className="text-xs text-slate-400">
              {typeLabel} · Giá {priceLabel}
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-slate-200">
            {typeLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {link ? (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="h-8 rounded-full bg-amber-400/15 text-amber-100 hover:bg-amber-400/25"
            >
              <Link href={link}>{action}</Link>
            </Button>
          ) : null}

          {status === "activated" ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-full border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
            >
              <Link href="/my-library">Thư viện của tôi</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function productLink(item: OrderItem): Route | null {
  const slug = item.product?.slug;
  if (!slug) return null;
  if (item.productType === "course") return `/khoa-hoc/${slug}` as Route;
  if (item.productType === "resource") return `/thu-vien/${slug}` as Route;
  return `/vfx/${slug}` as Route;
}

function getThumbUrl(item: OrderItem, mediaMap: Map<string, MediaDoc>) {
  const mediaId =
    item.product?.thumbnailMediaId || item.product?.coverImageId || item.product?.thumbnailId;
  if (!mediaId) return null;
  const media = mediaMap.get(String(mediaId));
  return media?.url ?? media?.externalUrl ?? null;
}

function productTypeLabel(type: OrderItem["productType"]) {
  if (type === "course") return "Khóa học";
  if (type === "resource") return "Thư viện";
  return "VFX";
}

function fallbackTitle(type: OrderItem["productType"], id?: string) {
  if (type === "course") return "Khóa học";
  if (type === "resource") return "Tài nguyên thư viện";
  return `Hiệu ứng VFX${id ? ` (${shortId(id)})` : ""}`;
}

function actionLabel(type: OrderItem["productType"], status: OrderStatus) {
  if (status === "activated") {
    if (type === "course") return "Vào học";
    if (type === "resource") return "Tải / xem";
    return "Xem hiệu ứng";
  }
  return "Xem chi tiết";
}

function getOrderAmount(order: Pick<OrderDoc, "totalAmount" | "amount">) {
  return order.totalAmount ?? order.amount ?? 0;
}

function shortId(value: string) {
  return value.slice(-6).toUpperCase();
}
