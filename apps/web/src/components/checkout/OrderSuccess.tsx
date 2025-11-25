'use client';

import Link from 'next/link';
import { CheckCircle, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

type OrderSuccessProps = {
  orderNumber: string;
  amount: number;
  itemCount: number;
};

const TRANSFER_NOTE = 'CK DOHY STUDIO';

export default function OrderSuccess({ orderNumber, amount, itemCount }: OrderSuccessProps) {
  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Đã tạo đơn hàng thành công!</h2>
          <p className="text-sm text-slate-400">Cảm ơn bạn đã tin tưởng DOHY.</p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-center justify-between text-sm text-slate-200">
          <span>Mã đơn hàng</span>
          <code className="rounded bg-black/30 px-2 py-1 font-mono text-emerald-200">
            {orderNumber}
          </code>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-200">
          <span>Số sản phẩm</span>
          <span className="font-semibold">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between border-t border-emerald-500/30 pt-3">
          <span className="text-sm font-semibold">Tổng tiền</span>
          <span className="text-2xl font-bold text-emerald-300">{formatPrice(amount)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#0b1224] p-4 space-y-2 text-sm text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-amber-300">
          <Info className="w-4 h-4" />
          Hướng dẫn thanh toán nhanh
        </div>
        <ul className="space-y-1 list-disc list-inside">
          <li>Mở ứng dụng ngân hàng và quét mã QR ở khung bên cạnh.</li>
          <li>
            Nội dung chuyển khoản: <strong>{orderNumber}</strong> hoặc {TRANSFER_NOTE}.
          </li>
          <li>Đơn sẽ tự động kích hoạt sau khi đối soát thành công.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button size="lg" className="w-full font-semibold" asChild>
          <Link href="/don-dat">Xem đơn đã đặt</Link>
        </Button>
        <Button size="lg" variant="outline" className="w-full font-semibold text-black" asChild>
          <Link href="/khoa-hoc">Tiếp tục mua sắm</Link>
        </Button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Cần hỗ trợ? Liên hệ{' '}
        <Link href="mailto:support@dohy.dev" className="text-amber-300 hover:underline">
          support@dohy.dev
        </Link>
      </p>
    </div>
  );
}
