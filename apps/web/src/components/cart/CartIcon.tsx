'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import CartDrawer from './CartDrawer';

type CartIconProps = { tone?: 'default' | 'light'; className?: string };

export default function CartIcon({ tone = 'default', className }: CartIconProps) {
  const { getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const count = getItemCount();
  const buttonClass = cn(
    'relative p-2 rounded-lg transition-colors',
    tone === 'light' ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted',
    className,
  );
  const iconClass = tone === 'light' ? 'w-5 h-5 text-white' : 'w-5 h-5';

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClass} aria-label="Mở giỏ hàng">
        <ShoppingCart className={iconClass} />
        {count > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
