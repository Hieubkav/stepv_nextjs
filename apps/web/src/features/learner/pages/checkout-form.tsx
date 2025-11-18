'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { api } from '@dohy/backend/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';

export type PaymentConfig = {
  bankAccountNumber: string;
  bankAccountName: string;
  bankCode: string;
  bankBranch?: string | null;
};

interface CheckoutFormProps {
  courseId: Id<'courses'>;
  studentId: Id<'students'>;
  courseName: string;
  coursePrice: number;
  courseThumbnailUrl?: string;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export default function CheckoutForm({
  courseId,
  studentId,
  courseName,
  coursePrice,
  courseThumbnailUrl,
}: CheckoutFormProps) {
  const router = useRouter();
  const createOrderMutation = useMutation(api.payments.createOrder);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<Id<'orders'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await createOrderMutation({
        studentId,
        courseId,
      });

      setOrderId(result.orderId);
      if (result.alreadyPending) {
        setSuccessMessage(
          result.activated
            ? 'Bạn đã có quyền truy cập khóa học này.'
            : 'Bạn đã có một đơn đang xử lý cho khóa học này.',
        );
      } else {
        setSuccessMessage(
          result.activated
            ? 'Đơn đã được ghi nhận và khóa học mở ngay lập tức.'
            : 'Đơn đã được ghi nhận.',
        );
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-none border rounded-2xl">
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button size="lg" className="w-full font-semibold" onClick={handlePlaceOrder} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Xác nhận đặt khóa'
          )}
        </Button>

        {successMessage && orderId ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
            <p className="font-mono text-xs bg-white/60 rounded px-2 py-1 w-fit">Mã đơn: {orderId}</p>
            <Button
              onClick={() => router.push(`/khoa-hoc/don-dat?orderId=${encodeURIComponent(String(orderId))}`)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Xem đơn đã đặt
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function buildTransferNote(courseName: string, orderId?: Id<'orders'> | null) {
  const normalized = courseName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 10)
    .toUpperCase();
  const safeCourse = normalized || 'COURSE';
  if (orderId) {
    const suffix = orderId.toString().slice(-6).toUpperCase();
    return `DOHY-${safeCourse}-${suffix}`;
  }
  return `DOHY-${safeCourse}`;
}
