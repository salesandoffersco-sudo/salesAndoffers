"use client";

import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

export default function CartIcon() {
  const { getTotalItems, toggleCart } = useCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-[rgb(var(--color-fg))] hover:text-purple-600 transition-colors"
      aria-label="Shopping cart"
    >
      <FiShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}