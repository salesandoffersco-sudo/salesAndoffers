"use client";

import { Fragment } from 'react';
import { FiX, FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import Button from './Button';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { state, removeFromCart, updateQuantity, closeCart, getTotalItems, getTotalPrice } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push('/cart/checkout');
  };

  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeCart} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[rgb(var(--color-card))] shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] p-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))]">
              Shopping Cart ({getTotalItems()})
            </h2>
            <button
              onClick={closeCart}
              className="rounded-full p-2 hover:bg-[rgb(var(--color-ui))] transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FiShoppingCart className="h-16 w-16 text-[rgb(var(--color-muted))] mb-4" />
                <h3 className="text-lg font-medium text-[rgb(var(--color-fg))] mb-2">Your cart is empty</h3>
                <p className="text-[rgb(var(--color-muted))] mb-4">Add some deals to get started!</p>
                <Button variant="primary" onClick={() => { closeCart(); router.push('/offers'); }}>
                  Browse Deals
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.dealId} className="border border-[rgb(var(--color-border))] rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[rgb(var(--color-fg))] truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                          by {item.seller.business_name}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm font-bold text-purple-600">
                            KES {item.discountedPrice}
                          </span>
                          <span className="text-xs text-[rgb(var(--color-muted))] line-through">
                            KES {item.originalPrice}
                          </span>
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            {item.discountPercentage}% OFF
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.dealId, item.quantity - 1)}
                              disabled={item.quantity <= item.minPurchase}
                              className="p-1 rounded border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-ui))] disabled:opacity-50"
                            >
                              <FiMinus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.dealId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxPurchase || item.quantity >= item.availableVouchers}
                              className="p-1 rounded border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-ui))] disabled:opacity-50"
                            >
                              <FiPlus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.dealId)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right mt-2">
                          <span className="text-sm font-bold text-[rgb(var(--color-fg))]">
                            Subtotal: KES {(item.discountedPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-[rgb(var(--color-border))] p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[rgb(var(--color-fg))]">Total:</span>
                <span className="text-xl font-bold text-purple-600">
                  KES {getTotalPrice().toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => { closeCart(); router.push('/offers'); }}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}