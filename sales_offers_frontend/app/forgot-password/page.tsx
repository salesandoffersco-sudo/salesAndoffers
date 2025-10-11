"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(`${API_BASE_URL}/api/accounts/forgot-password/`, { email });
      setMessage("If an account with that email exists, we've sent you a password reset link.");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
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
              Forgot Password?
            </h2>
            <p className="text-[rgb(var(--color-muted))] mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {message && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))]"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-on-primary))] py-3 rounded-lg font-medium transition-all"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 font-medium">
              <FiArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}