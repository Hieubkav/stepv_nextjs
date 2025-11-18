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
    label: 'Đang xử lý',
    tone: 'border-amber-200 bg-amber-50 text-amber-800',
    description: 'Đơn vừa tạo và sẽ được kích hoạt trong giây lát.',
  },
  paid: {
    label: 'Đã xử lý',
    tone: 'border-sky-200 bg-sky-50 text-sky-800',
    description: 'Đơn đã được hệ thống tiếp nhận.',
  },
  completed: {
    label: 'Đã kích hoạt',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    description: 'Bạn đã có thể học toàn bộ nội dung khóa.',
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
    <div className="space-y-6 py-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Learner</p>
        <h1 className="text-2xl font-semibold leading-tight">Đơn đặt khóa học</h1>
        <p className="text-sm text-muted-foreground">
          Đây là phiên bản MVP nên sau khi đặt đơn hệ thống sẽ kích hoạt khóa học tự động, không cần gửi minh chứng.
        </p>
      </div>

      <Card className="border-dashed border-blue-200 bg-blue-50/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-blue-900">Quy trình đơn giản</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {['Nhấn “Xác nhận đặt khóa” tại trang Checkout', 'Hệ thống kích hoạt khóa ngay', 'Vào học trong mục khóa học đã mua'].map(
            (label, index) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-900">{label}</p>
              </div>
            ),
          )}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{order.courseName}</CardTitle>
            <p className="text-xs text-muted-foreground">Mã đơn: {shortId(order._id)}</p>
          </div>
          <Badge className={cn('text-xs', orderStatus.tone)}>{orderStatus.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{currencyFormatter.format(order.amount)}</span>
          <span>Đặt ngày: {dateTimeFormatter.format(new Date(order.createdAt))}</span>
          <span>Cập nhật: {dateTimeFormatter.format(new Date(order.updatedAt))}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {order.status === 'cancelled' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Đơn đã hủy</AlertTitle>
            <AlertDescription>Liên hệ đội ngũ hỗ trợ nếu bạn cần kích hoạt lại đơn này.</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <OrderProgress currentStepIndex={currentStepIndex} />
            <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
              <p className="font-semibold text-foreground">Tình trạng</p>
              <p className="text-muted-foreground">{orderStatus.description}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {order.courseSlug ? (
            <Button asChild>
              <Link href={`/khoa-hoc/${order.courseSlug}`}>
                {order.status === 'completed' ? 'Vào học ngay' : 'Xem chi tiết khóa học'}
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/khoa-hoc">Khám phá khóa khác</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderProgress({ currentStepIndex }: { currentStepIndex: number }) {
  const steps = [
    {
      label: 'Đặt đơn',
      description: 'Bạn đã xác nhận mua khóa.',
    },
    {
      label: 'Hệ thống xử lý',
      description: 'Đơn được kích hoạt tự động trong giây lát.',
    },
    {
      label: 'Vào học',
      description: 'Khóa đã mở toàn bộ nội dung.',
    },
  ];

  return (
    <div className="space-y-3 rounded-xl border bg-background p-4">
      {steps.map((step, index) => {
        const reached = currentStepIndex >= index;
        const Icon = reached ? CheckCircle : Clock;
        return (
          <div key={step.label} className="flex gap-3">
            <Icon className={cn('h-4 w-4 mt-1', reached ? 'text-emerald-600' : 'text-muted-foreground')} />
            <div>
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
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
