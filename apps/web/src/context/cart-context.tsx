'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
    id: string;
    productType: 'course' | 'resource' | 'vfx';
    title: string;
    price: number;
    thumbnail?: string;
};

type CartContextType = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    hasDuplicate: (productType: string, productId: string) => boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_items';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load từ localStorage lần đầu
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse cart from storage:', e);
                setItems([]);
            }
        }
        setIsHydrated(true);
    }, []);

    // Lưu vào localStorage mỗi khi items thay đổi
    useEffect(() => {
        if (!isHydrated) return;
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items, isHydrated]);

    const addItem = useCallback((newItem: CartItem) => {
        setItems((prev) => {
            // Check duplicate - nếu cùng type và id thì không thêm
            const exists = prev.find(
                (item) => item.productType === newItem.productType && item.id === newItem.id
            );
            if (exists) return prev;
            return [...prev, newItem];
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const getTotal = useCallback(() => {
        return items.reduce((sum, item) => sum + item.price, 0);
    }, [items]);

    const getItemCount = useCallback(() => {
        return items.length;
    }, [items]);

    const hasDuplicate = useCallback(
        (productType: string, productId: string) => {
            return items.some((item) => item.productType === productType && item.id === productId);
        },
        [items]
    );

    const value = useMemo<CartContextType>(
        () => ({
            items,
            addItem,
            removeItem,
            clearCart,
            getTotal,
            getItemCount,
            hasDuplicate,
        }),
        [items, addItem, removeItem, clearCart, getTotal, getItemCount, hasDuplicate]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
