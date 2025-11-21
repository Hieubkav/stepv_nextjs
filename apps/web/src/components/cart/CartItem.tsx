'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { CartItem as CartItemType, useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/format';

type CartItemProps = {
    item: CartItemType;
};

const productTypeLabels = {
    course: '🎓 Khóa học',
    resource: '📦 Tài nguyên',
    vfx: '✨ VFX',
};

export default function CartItem({ item }: CartItemProps) {
    const { removeItem } = useCart();

    return (
        <div className="flex gap-3 py-3 border-b">
            {/* Thumbnail */}
            {item.thumbnail && (
                <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-muted">
                    <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                    {productTypeLabels[item.productType]}
                </p>
                <h4 className="font-medium truncate text-sm">{item.title}</h4>
                <p className="text-sm font-semibold text-primary mt-1">
                    {formatPrice(item.price)}
                </p>
            </div>

            {/* Remove button */}
            <button
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
                aria-label="Xóa khỏi giỏ"
            >
                <X className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
    );
}
