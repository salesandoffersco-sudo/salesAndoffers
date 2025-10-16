"use client";

import { FiX, FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { useCart } from "../contexts/CartContext";
import Button from "./Button";

export default function CartSidebar() {
  const { state, closeCart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();

  if (!state.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-[rgb(var(--color-card))] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">
              Shopping Cart ({getTotalItems()})
            </h2>
            <button
              onClick={closeCart}
              className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingCart className="w-16 h-16 text-[rgb(var(--color-muted))] mx-auto mb-4" />
                <p className="text-[rgb(var(--color-muted))]">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.dealId} className="bg-[rgb(var(--color-bg))] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[rgb(var(--color-text))] text-sm">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[rgb(var(--color-muted))]">
                          by {item.seller.business_name}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.dealId)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.dealId, item.quantity - 1)}
                          disabled={item.quantity <= item.minPurchase}
                          className="w-8 h-8 rounded-full border border-[rgb(var(--color-border))] flex items-center justify-center disabled:opacity-50"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.dealId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxPurchase || item.quantity >= item.availableVouchers}
                          className="w-8 h-8 rounded-full border border-[rgb(var(--color-border))] flex items-center justify-center disabled:opacity-50"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-purple-600">
                          KES {(item.discountedPrice * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-muted))] line-through">
                          KES {(item.originalPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-[rgb(var(--color-border))] p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-[rgb(var(--color-text))]">Total:</span>
                <span className="text-xl font-bold text-purple-600">
                  KES {getTotalPrice().toFixed(2)}
                </span>
              </div>
              
              <Link href="/cart/checkout" onClick={closeCart}>
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}