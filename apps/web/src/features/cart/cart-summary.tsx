import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';

type CartSummaryProps = {
  total: number;
  itemCount: number;
};

export function CartSummary({ total, itemCount }: CartSummaryProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800/70 bg-[#050914]/90 p-5 text-slate-50 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Tổng ({itemCount} sản phẩm)</span>
        <span className="text-xl font-bold text-amber-300 drop-shadow-[0_0_18px_rgba(255,193,7,0.35)]">
          {formatPrice(total)}
        </span>
      </div>
      <Button className="w-full" size="lg" asChild disabled={itemCount === 0}>
        <Link href="/checkout">Thanh toán</Link>
      </Button>
      <p className="text-xs text-slate-400">
        Sản phẩm digital chỉ cần mua một lần; kiểm tra kỹ trước khi thanh toán.
      </p>
    </div>
  );
}
