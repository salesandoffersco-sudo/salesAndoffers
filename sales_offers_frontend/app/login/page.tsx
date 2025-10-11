"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import GoogleAuth from "../../components/GoogleAuth";
import { API_BASE_URL } from "../../lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();

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

    // Check for message from URL params
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/accounts/login/`, formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.user.username);
      localStorage.setItem("userProfile", JSON.stringify({
        name: `${response.data.user.first_name} ${response.data.user.last_name}`.trim() || response.data.user.username,
        profilePicture: response.data.user.profile_picture
      }));
      window.dispatchEvent(new Event("authChange"));
      router.push("/offers");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-xl p-6 sm:p-8 border border-[rgb(var(--color-border))] w-full max-w-md">
          {/* Logo */}
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to your account
            </p>
          </div>

          {/* Google Auth */}
          <GoogleAuth onSuccess={handleGoogleSuccess} />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[rgb(var(--color-card))] text-[rgb(var(--color-muted))]">Or continue with username</span>
            </div>
          </div>

          {message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                <input
                  name="username"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))]"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))]"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))]"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-on-primary))] py-3 rounded-lg font-medium transition-all"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-[rgb(var(--color-muted))] mt-6 space-y-2">
            <p>
              <Link href="/forgot-password" className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 font-medium">
                Forgot your password?
              </Link>
            </p>
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
