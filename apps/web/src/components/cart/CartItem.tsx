'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import type { CartItem as CartItemType } from '@/context/cart-context';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/format';

type CartItemProps = {
  item: CartItemType;
  onRemove?: (item: CartItemType) => void;
};

const productTypeLabels: Record<CartItemType['productType'], string> = {
  course: 'Khoá học',
  resource: 'Tài nguyên',
  vfx: 'VFX',
};

export default function CartItem({ item, onRemove }: CartItemProps) {
  const { removeItem } = useCart();
  const handleRemove = () => {
    if (onRemove) {
      onRemove(item);
      return;
    }
    removeItem(item.id, item.productType);
  };

  return (
    <div className="flex gap-3 border-b border-slate-800/70 px-4 py-3 last:border-none">
      {item.thumbnail && (
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-slate-800/70">
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">
          {productTypeLabels[item.productType]}
        </p>
        <h4 className="truncate text-sm font-semibold text-slate-50">{item.title}</h4>
        <p className="mt-1 text-sm font-semibold text-amber-300">{formatPrice(item.price)}</p>
      </div>

      <button
        onClick={handleRemove}
        className="flex-shrink-0 rounded p-1 transition-colors hover:bg-slate-800/80"
        aria-label="Xoá khỏi giỏ"
      >
        <X className="h-4 w-4 text-slate-400" />
      </button>
    </div>
  );
}
