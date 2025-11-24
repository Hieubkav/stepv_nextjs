'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

type OrderSuccessProps = {
  orderNumber: string;
  amount: number;
  itemCount: number;
};

export default function OrderSuccess({ orderNumber, amount, itemCount }: OrderSuccessProps) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 text-center">
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse" />
          <CheckCircle className="relative h-20 w-20 text-green-600" />
        </div>
      </div>

      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Đã tạo đơn hàng thành công!</h1>
        <p className="text-muted-foreground">Cảm ơn bạn đã đặt mua tại DOHY.</p>
      </div>

      <div className="space-y-3 rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
          <code className="font-mono text-lg font-bold text-primary">{orderNumber}</code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Số sản phẩm:</span>
          <span className="font-bold">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-semibold text-foreground">Tổng tiền:</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(amount)}</span>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
        <h3 className="font-bold text-blue-900">Hướng dẫn thanh toán:</h3>
        <ol className="space-y-2 text-sm text-blue-900">
          <li>
            <strong>1.</strong> Mở ứng dụng ngân hàng của bạn.
          </li>
          <li>
            <strong>2.</strong> Quét mã QR / chuyển khoản tới tài khoản ở khung bên cạnh.
          </li>
          <li>
            <strong>3.</strong> Nội dung chuyển khoản: <code className="font-mono font-bold">{orderNumber}</code>
          </li>
          <li>
            <strong>4.</strong> Đơn sẽ được kích hoạt ngay sau khi đối soát thành công.
          </li>
        </ol>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-xs text-red-800">
          ⚠️ <strong>Lưu ý:</strong> Nếu nội dung chuyển khoản không đúng mã đơn hàng, hệ thống sẽ
          không tự động xác nhận. Vui lòng kiểm tra trước khi gửi.
        </p>
      </div>

      <div className="space-y-2">
        <Button size="lg" className="w-full" asChild>
          <Link href="/my-library">Xem thư viện của tôi</Link>
        </Button>
        <Button size="lg" variant="outline" className="w-full" asChild>
          <Link href="/khoa-hoc">Tiếp tục mua sắm</Link>
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Cần hỗ trợ? Liên hệ{' '}
          <Link href="mailto:support@dohy.dev" className="text-primary hover:underline">
            support@dohy.dev
          </Link>
        </p>
      </div>
    </div>
  );
}
