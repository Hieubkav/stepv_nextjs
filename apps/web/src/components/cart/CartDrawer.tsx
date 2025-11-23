'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import CartItem from './CartItem';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, getTotal, getItemCount, clearCart } = useCart();
  const total = getTotal();
  const count = getItemCount();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-slate-800/70 bg-[#050914] text-slate-50 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800/70 p-4">
          <h2 className="text-lg font-bold">Giỏ hàng ({count})</h2>
          <button
            onClick={onClose}
            className="rounded p-1 transition-colors hover:bg-slate-800/80"
            aria-label="Đóng giỏ hàng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {count === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="mb-4 text-slate-400">Giỏ hàng trống</p>
              <Button variant="outline" onClick={onClose} asChild>
                <Link href="/khoa-hoc">Bắt đầu mua sắm</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem key={`${item.productType}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {count > 0 && (
          <div className="space-y-2 border-t border-slate-800/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">Tổng cộng:</span>
              <span className="text-lg font-bold text-amber-300">{formatPrice(total)}</span>
            </div>

            <Button size="lg" className="w-full" onClick={handleCheckout} asChild>
              <Link href="/checkout">Thanh toán</Link>
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={clearCart}>
              Xoá tất cả
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
