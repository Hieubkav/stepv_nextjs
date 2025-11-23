'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartProductType = 'course' | 'resource' | 'vfx';

export type CartItem = {
  id: string;
  productType: CartProductType;
  title: string;
  price: number;
  thumbnail?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, productType?: CartProductType) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  hasDuplicate: (productType: CartProductType, productId: string) => boolean;
  isHydrated: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_items';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      setIsHydrated(true);
      return;
    }
    try {
      setItems(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to parse cart from storage:', error);
      setItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const exists = prev.some(
        (item) => item.productType === newItem.productType && item.id === newItem.id,
      );
      return exists ? prev : [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((id: string, productType?: CartProductType) => {
    setItems((prev) =>
      prev.filter((item) =>
        productType ? item.id !== id || item.productType !== productType : item.id !== id,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getTotal = useCallback(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  const getItemCount = useCallback(() => items.length, [items]);

  const hasDuplicate = useCallback(
    (productType: CartProductType, productId: string) =>
      items.some((item) => item.productType === productType && item.id === productId),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      getTotal,
      getItemCount,
      hasDuplicate,
      isHydrated,
    }),
    [items, addItem, removeItem, clearCart, getTotal, getItemCount, hasDuplicate, isHydrated],
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
