"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheckCircle, FiXCircle, FiLoader, FiShoppingBag } from "react-icons/fi";
import Button from "../../../components/Button";
import { api } from "../../../lib/api";

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [voucher, setVoucher] = useState<any>(null);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (reference) {
      verifyPayment(reference);
    } else {
      setStatus('failed');
      setError('No payment reference found');
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await api.post('/api/payments/verify/', { reference }, {
        headers: { Authorization: `Token ${token}` }
      });

      if (response.data.status === 'success') {
        setStatus('success');
        setVoucher(response.data);
      } else {
        setStatus('failed');
        setError('Payment verification failed');
      }
    } catch (error: any) {
      setStatus('failed');
      setError(error.response?.data?.error || 'Payment verification failed');
    }
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  const handleContinueShopping = () => {
    router.push('/offers');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Verifying Payment</h1>
          <p className="text-[rgb(var(--color-muted))]">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Payment Failed</h1>
          <p className="text-[rgb(var(--color-muted))] mb-6">{error}</p>
          <div className="space-y-3">
            <Button variant="primary" onClick={handleContinueShopping} className="w-full">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Payment Successful!</h1>
        <p className="text-[rgb(var(--color-muted))] mb-6">
          Your order has been confirmed. Voucher code: <span className="font-mono font-bold">{voucher?.voucher_code}</span>
        </p>
        
        <div className="bg-[rgb(var(--color-card))] rounded-lg p-4 mb-6 border border-[rgb(var(--color-border))]">
          <div className="flex items-center justify-center mb-2">
            <FiShoppingBag className="w-5 h-5 text-purple-600 mr-2" />
            <span className="font-semibold">Order Details</span>
          </div>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            You can view and manage your order in the Orders section
          </p>
        </div>

        <div className="space-y-3">
          <Button variant="primary" onClick={handleViewOrders} className="w-full">
            View My Orders
          </Button>
          <Button variant="outline" onClick={handleContinueShopping} className="w-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}