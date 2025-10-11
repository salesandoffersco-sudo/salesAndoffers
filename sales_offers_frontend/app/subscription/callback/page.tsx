"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

export default function SubscriptionCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) {
      verifyPayment(reference);
    } else {
      setStatus('error');
      setMessage('Invalid payment reference');
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/sellers/verify-payment/`,
        { reference },
        { headers: { Authorization: `Token ${token}` } }
      );

      setStatus('success');
      setMessage('Payment verified successfully! Your subscription is now active.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Payment verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] p-8 text-center">
          {status === 'loading' && (
            <>
              <FiLoader className="animate-spin text-6xl text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
                Verifying Payment
              </h1>
              <p className="text-[rgb(var(--color-muted))]">
                Please wait while we verify your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
                Payment Successful!
              </h1>
              <p className="text-[rgb(var(--color-muted))] mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link href="/seller/dashboard">
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full">
                    View Plans
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
                Payment Failed
              </h1>
              <p className="text-[rgb(var(--color-muted))] mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link href="/pricing">
                  <Button variant="primary" className="w-full">
                    Try Again
                  </Button>
                </Link>
                <Link href="/seller/dashboard">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}