import { useCallback } from 'react';
import type { CartItem } from '@/context/cart-context';

export function useConfirmRemove(
  removeItem: (id: string, type?: CartItem['productType']) => void,
) {
  return useCallback(
    (item: CartItem) => {
      if (window.confirm('Xoá sản phẩm này khỏi giỏ hàng?')) {
        removeItem(item.id, item.productType);
      }
    },
    [removeItem],
  );
}
