'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart, type CartItem } from '@/context/cart-context';
import { useCustomerAuth } from '@/features/auth';
import { CartEmpty } from '@/features/cart/cart-empty';
import { CartList } from '@/features/cart/cart-list';
import { CartSummary } from '@/features/cart/cart-summary';
import { useHeaderOffset } from '@/features/cart/use-header-offset';
import { useConfirmRemove } from '@/features/cart/use-confirm-remove';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, getTotal, isHydrated } = useCart();
  const { status } = useCustomerAuth();
  const headerOffset = useHeaderOffset();
  const handleRemove = useConfirmRemove(removeItem);

  useEffect(() => {
    if (status === 'idle') router.replace('/login');
  }, [status, router]);

  if (status === 'loading' || !isHydrated) return <CartLoading />;
  if (status === 'idle') return <CartRedirecting />;

  const hasItems = items.length > 0;

  return (
    <CartShell headerOffset={headerOffset}>
      <CartHeader itemCount={items.length} onClear={clearCart} />
      {hasItems ? (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <CartList items={items} onRemove={handleRemove} />
          <CartSummary total={getTotal()} itemCount={items.length} />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800/70 bg-[#050914]/80 px-6 py-12 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <CartEmpty />
        </div>
      )}
    </CartShell>
  );
}

function CartShell({ headerOffset, children }: { headerOffset: number; children: React.ReactNode }) {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-50 selection:bg-amber-500/25 selection:text-amber-100"
      style={{ paddingTop: headerOffset }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute right-[-20%] top-4 h-80 w-80 rounded-full bg-sky-500/10 blur-[150px]" />
        <div className="absolute left-1/3 bottom-[-28%] h-96 w-96 rounded-full bg-indigo-600/10 blur-[190px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-14 md:px-6">
        {children}
      </div>
    </main>
  );
}

function CartHeader({ itemCount, onClear }: { itemCount: number; onClear: () => void }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          DIGITAL ONLY
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">Giỏ hàng</h1>
        <p className="text-sm text-slate-400">Sản phẩm digital mua một lần, lưu mãi mãi.</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={itemCount === 0}
        className="text-slate-200 hover:text-amber-200 hover:bg-amber-500/10"
      >
        Xoá tất cả
      </Button>
    </div>
  );
}

const CartLoading = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-[#030712]">
    <div className="space-y-3 text-center text-slate-200">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-amber-400" />
      <p className="text-sm text-slate-400">Đang tải giỏ hàng...</p>
    </div>
  </div>
);

const CartRedirecting = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-[#030712]">
    <p className="text-sm text-slate-400">Đang chuyển sang trang đăng nhập...</p>
  </div>
);
