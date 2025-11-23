import CartItem from '@/components/cart/CartItem';
import type { CartItem as CartItemType } from '@/context/cart-context';

type CartListProps = {
  items: CartItemType[];
  onRemove?: (item: CartItemType) => void;
};

export function CartList({ items, onRemove }: CartListProps) {
  return (
    <div className="rounded-xl border border-slate-800/70 bg-[#050914]/90 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      {items.map((item) => (
        <CartItem key={`${item.productType}-${item.id}`} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}
