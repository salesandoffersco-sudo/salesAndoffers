"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCreditCard, FiLock, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../../contexts/CartContext';
import Button from '../../../components/Button';
import axios from 'axios';
import { API_BASE_URL } from '../../../lib/api';

export default function CheckoutPage() {
  const { state, clearCart, getTotalPrice } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (state.items.length === 0) {
      router.push("/offers");
      return;
    }

    setProcessing(true);
    try {
      // Process each item separately (since each deal needs its own voucher)
      const paymentPromises = state.items.map(async (item) => {
        const response = await axios.post(
          `${API_BASE_URL}/api/payments/initialize/`,
          {
            deal_id: item.dealId,
            quantity: item.quantity
          },
          {
            headers: { Authorization: `Token ${token}` }
          }
        );
        return response.data;
      });

      const paymentResults = await Promise.all(paymentPromises);
      
      // Clear cart after successful initialization
      clearCart();
      
      // Redirect to first payment (in a real app, you might want to handle multiple payments differently)
      if (paymentResults.length > 0) {
        window.location.href = paymentResults[0].authorization_url;
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      alert(error.response?.data?.error || "Failed to process payment");
      setProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Your cart is empty</h1>
          <Button variant="primary" onClick={() => router.push('/offers')}>
            Browse Deals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.dealId} className="flex items-center space-x-4 pb-4 border-b border-[rgb(var(--color-border))]">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-[rgb(var(--color-fg))]">{item.title}</h3>
                    <p className="text-sm text-[rgb(var(--color-muted))]">by {item.seller.business_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-bold text-purple-600">
                        KES {item.discountedPrice} × {item.quantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-bold text-[rgb(var(--color-fg))]">
                      KES {(item.discountedPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[rgb(var(--color-border))]">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-purple-600">KES {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-6">Payment</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FiCreditCard className="text-blue-600 h-6 w-6" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Secure Payment with Paystack</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Pay securely with M-Pesa, Card, or Bank Transfer
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-[rgb(var(--color-muted))]">
                  <FiLock className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
                
                <div className="text-sm text-[rgb(var(--color-muted))]">
                  <p>• Vouchers will be generated immediately after successful payment</p>
                  <p>• You'll receive QR codes for easy redemption</p>
                  <p>• Check your vouchers in the "My Vouchers" section</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FiCreditCard className="mr-2" />
                    Pay KES {getTotalPrice().toFixed(2)}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}