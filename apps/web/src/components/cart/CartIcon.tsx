'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';

type CartIconProps = {
  tone?: 'default' | 'light';
  className?: string;
};

export default function CartIcon({ tone = 'default', className }: CartIconProps) {
  const router = useRouter();
  const { getItemCount } = useCart();
  const count = getItemCount();

  const buttonClass = cn(
    'relative rounded-lg p-2 transition-colors',
    tone === 'light' ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted',
    className,
  );

  const iconClass = tone === 'light' ? 'h-5 w-5 text-white' : 'h-5 w-5';

  const handleClick = () => {
    router.push('/gio-hang');
  };

  return (
    <button type="button" onClick={handleClick} className={buttonClass} aria-label="Mở giỏ hàng">
      <ShoppingCart className={iconClass} />
      {count > 0 && (
        <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
