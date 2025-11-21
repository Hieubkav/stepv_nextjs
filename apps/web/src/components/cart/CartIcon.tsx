'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import CartDrawer from './CartDrawer';

export default function CartIcon() {
    const { getItemCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const count = getItemCount();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Mở giỏ hàng"
            >
                <ShoppingCart className="w-5 h-5" />
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
