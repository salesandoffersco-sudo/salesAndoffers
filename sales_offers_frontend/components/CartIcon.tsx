"use client";

import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useState, useEffect } from 'react';

export default function CartIcon() {
  const { getTotalItems, toggleCart } = useCart();
  const itemCount = getTotalItems();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (itemCount > prevCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);

  return (
    <button
      onClick={toggleCart}
      className={`relative p-2 text-[rgb(var(--color-fg))] hover:text-purple-600 transition-all duration-300 hover:scale-110 ${
        isAnimating ? 'animate-bounce' : ''
      }`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <FiShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg border-2 border-white dark:border-gray-800 ${
          isAnimating ? 'animate-pulse scale-125' : ''
        }`}>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      {itemCount === 0 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full opacity-50"></span>
      )}
    </button>
  );
}