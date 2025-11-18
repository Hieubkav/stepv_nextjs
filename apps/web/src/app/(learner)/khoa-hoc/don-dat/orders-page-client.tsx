'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Loader2, Receipt, ArrowRight } from 'lucide-react';

type StudentOrder = {
  _id: Id<'orders'>;
  courseId: Id<'courses'>;
  courseName: string;
  courseSlug?: string;
  thumbnailUrl?: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
};

type OrdersPageClientProps = {
  highlightOrderId?: string;
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const ORDER_STATUS_LABELS: Record<StudentOrder['status'], { label: string; tone: string; description: string }> = {
  pending: {
    label: 'Chờ xác nhận',
    tone: 'border-amber-200 bg-amber-50 text-amber-800',
    description: 'Đơn vừa được đặt, chờ admin xác nhận thanh toán.',
  },
  paid: {
    label: 'Đã xác nhận',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    description: 'Thanh toán đã được xác nhận, bạn có quyền truy cập khóa học.',
  },
  completed: {
    label: 'Hoàn thành',
    tone: 'border-blue-200 bg-blue-50 text-blue-800',
    description: 'Bạn đã hoàn thành khóa học này.',
  },
  cancelled: {
    label: 'Đã hủy',
    tone: 'border-rose-200 bg-rose-50 text-rose-800',
    description: 'Đơn bị hủy. Hãy liên hệ hỗ trợ nếu cần mở lại.',
  },
};

export default function OrdersPageClient({ highlightOrderId }: OrdersPageClientProps) {
  const { student } = useStudentAuth();
  const orders = useQuery(
    api.payments.listStudentOrders,
    student ? { studentId: student._id } : 'skip',
  ) as StudentOrder[] | undefined;

  const [pinnedOrderId, setPinnedOrderId] = useState<string | null>(highlightOrderId ?? null);

  useEffect(() => {
    if (!highlightOrderId) return;
    setPinnedOrderId(highlightOrderId);
    const timer = window.setTimeout(() => setPinnedOrderId(null), 6000);
    return () => window.clearTimeout(timer);
  }, [highlightOrderId]);

  const pinnedOrder = useMemo(() => orders?.find((item) => item._id === pinnedOrderId), [orders, pinnedOrderId]);

  if (!student) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Vui lòng đăng nhập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Bạn cần đăng nhập để xem các đơn đã đặt.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/khoa-hoc/dang-nhap">Đăng nhập</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/khoa-hoc/dang-ky">Tạo tài khoản</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-2xl font-semibold leading-tight">Đơn đặt khóa học</h1>

      <Card className="border-dashed border-blue-200 bg-blue-50/60">
        <CardContent className="pt-3 pb-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {['Xác nhận đặt khóa', 'Hệ thống kích hoạt', 'Vào học'].map((label, index) => (
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
            Đơn {shortId(pinnedOrder._id)} cho khóa {pinnedOrder.courseName} đang ở trạng thái{' '}
            {ORDER_STATUS_LABELS[pinnedOrder.status].label.toLowerCase()}.
          </AlertDescription>
        </Alert>
      ) : null}

      {orders === undefined ? (
        <Card className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Đang tải đơn đặt...</span>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="mx-auto max-w-2xl text-center">
          <CardContent className="space-y-4 py-10">
            <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-base font-semibold">Bạn chưa có đơn đặt nào</p>
            <p className="text-sm text-muted-foreground">Khám phá khoá học và đặt mua để kích hoạt ngay.</p>
            <Button asChild>
              <Link href="/khoa-hoc">
                Xem khóa học
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} highlighted={order._id === pinnedOrderId} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, highlighted }: { order: StudentOrder; highlighted: boolean }) {
  const orderStatus = ORDER_STATUS_LABELS[order.status];
  const currentStepIndex =
    order.status === 'completed' ? 2 : order.status === 'paid' ? 1 : order.status === 'pending' ? 0 : -1;

  return (
    <Card className={cn('border border-border/60 shadow-sm', highlighted && 'border-primary shadow-lg')}>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex gap-3 sm:flex-1">
            {order.thumbnailUrl && (
              <img
                src={order.thumbnailUrl}
                alt={order.courseName}
                className="h-16 w-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{order.courseName}</CardTitle>
              <p className="text-xs text-muted-foreground">Mã đơn: {shortId(order._id)}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{currencyFormatter.format(order.amount)}</p>
            </div>
          </div>
          <Badge className={cn('text-xs shrink-0', orderStatus.tone)}>{orderStatus.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Đặt: {dateTimeFormatter.format(new Date(order.createdAt))}</span>
          <span>Cập nhật: {dateTimeFormatter.format(new Date(order.updatedAt))}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.status === 'cancelled' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Đơn đã hủy</AlertTitle>
            <AlertDescription>Liên hệ đội ngũ hỗ trợ nếu bạn cần kích hoạt lại đơn này.</AlertDescription>
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

        <div className="flex flex-wrap gap-2">
          {order.courseSlug ? (
            <Button asChild size="sm">
              <Link href={`/khoa-hoc/${order.courseSlug}`}>
                {order.status === 'completed' ? 'Vào học ngay' : 'Xem chi tiết'}
              </Link>
            </Button>
          ) : null}
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
    { label: 'Đặt đơn', desc: 'Bạn xác nhận mua' },
    { label: 'Chờ xác nhận', desc: 'Admin xác nhận' },
    { label: 'Vào học', desc: 'Truy cập khóa' },
  ];

  return (
    <div className="space-y-2 rounded-lg border bg-background p-3">
      {steps.map((step, index) => {
        const reached = currentStepIndex >= index;
        const Icon = reached ? CheckCircle : Clock;
        return (
          <div key={step.label} className="flex gap-2 items-start">
            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', reached ? 'text-emerald-600' : 'text-muted-foreground')} />
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

function shortId(value: string) {
  return value.slice(-6).toUpperCase();
}
