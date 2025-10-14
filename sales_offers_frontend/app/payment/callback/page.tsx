"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [voucherData, setVoucherData] = useState<any>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) {
      verifyPayment(reference);
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/verify/`,
        { reference },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setVoucherData(response.data);
        setStatus('success');
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-2">Verifying Payment</h1>
              <p className="text-[rgb(var(--color-muted))]">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-2">Payment Successful!</h1>
              <p className="text-[rgb(var(--color-muted))] mb-6">
                Your voucher has been generated successfully.
              </p>
              
              {voucherData && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-[rgb(var(--color-muted))] mb-2">Voucher Code:</p>
                  <p className="font-mono text-lg font-bold text-[rgb(var(--color-fg))]">
                    {voucherData.voucher_code}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/vouchers')}
                >
                  View My Vouchers
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/offers')}
                >
                  Browse More Deals
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <FiXCircle className="text-6xl text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-2">Payment Failed</h1>
              <p className="text-[rgb(var(--color-muted))] mb-6">
                We couldn't process your payment. Please try again.
              </p>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/offers')}
                >
                  Browse Deals
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}