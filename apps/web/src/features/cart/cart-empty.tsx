import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CartEmpty() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center text-slate-50">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/50 bg-amber-500/10">
        <ShoppingBag className="h-6 w-6 text-amber-200" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Giỏ hàng trống</h2>
        <p className="text-slate-400">Thêm sản phẩm digital để bắt đầu thanh toán.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/khoa-hoc">Khám phá khoá học</Link>
        </Button>
        <Button
          variant="outline"
          className="border-amber-400/60 bg-white/5 text-slate-100 hover:bg-amber-500/10 hover:text-amber-100"
          asChild
        >
          <Link href="/thu-vien">Tìm tài nguyên</Link>
        </Button>
      </div>
    </div>
  );
}
