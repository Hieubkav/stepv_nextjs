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
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/50"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-background shadow-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">
                        Giỏ hàng ({count})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        aria-label="Đóng giỏ hàng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {count === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
                            <Button variant="outline" onClick={onClose} asChild>
                                <Link href="/khoa-hoc">
                                    Bắt đầu mua sắm
                                </Link>
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

                {/* Footer */}
                {count > 0 && (
                    <div className="border-t p-4 space-y-3">
                        {/* Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Tổng cộng:</span>
                            <span className="text-lg font-bold text-primary">
                                {formatPrice(total)}
                            </span>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-2">
                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleCheckout}
                                asChild
                            >
                                <Link href="/checkout">
                                    Thanh toán
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={clearCart}
                            >
                                Xóa tất cả
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
