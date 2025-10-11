"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const uid = params?.params?.[0];
  const token = params?.params?.[1];

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    localStorage.getItem('theme') === 'dark' ||
                    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
    };

    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  useEffect(() => {
    if (uid && token) {
      verifyEmail();
    } else {
      setError("Invalid verification link");
      setLoading(false);
    }
  }, [uid, token]);

  const verifyEmail = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/users/verify-email/`, {
        uid,
        token
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login?message=Email verified successfully! You can now login.");
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-xl p-6 sm:p-8 border border-[rgb(var(--color-border))] w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <Image
                src="/images/sales_and_offers_logo.svg"
                alt="Sales & Offers"
                width={200}
                height={32}
                className="h-8 w-auto mx-auto mb-4"
                style={{ 
                  filter: isDarkMode 
                    ? 'brightness(0) saturate(100%) invert(89%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(89%)' 
                    : 'brightness(0) saturate(100%) invert(9%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(9%) contrast(89%)'
                }}
              />
            </Link>
            <h2 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
              Email Verification
            </h2>
          </div>

          <div className="text-center">
            {loading && (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--color-primary))] mx-auto mb-4"></div>
                <p className="text-[rgb(var(--color-muted))]">Verifying your email...</p>
              </div>
            )}

            {success && (
              <div>
                <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
                  Email Verified Successfully!
                </h3>
                <p className="text-[rgb(var(--color-muted))] mb-6">
                  Your account has been activated. You can now login and start using Sales & Offers.
                </p>
                <Button
                  onClick={handleLoginRedirect}
                  className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-on-primary))] py-3 rounded-lg font-medium transition-all"
                >
                  Continue to Login
                </Button>
              </div>
            )}

            {error && (
              <div>
                <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
                  Verification Failed
                </h3>
                <p className="text-[rgb(var(--color-muted))] mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <Link href="/register">
                    <Button className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-on-primary))] py-3 rounded-lg font-medium transition-all">
                      Register Again
                    </Button>
                  </Link>
                  <Link href="/login" className="block text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 font-medium">
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}