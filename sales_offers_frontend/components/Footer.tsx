"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check theme
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    localStorage.getItem('theme') === 'dark' ||
                    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
    };

    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    // Load Lato font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Apply Lato font to all elements
    const style = document.createElement('style');
    style.textContent = `
      * {
        font-family: 'Lato', sans-serif !important;
      }
    `;
    document.head.appendChild(style);

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener("authChange", checkAuth);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
      window.removeEventListener("authChange", checkAuth);
      // Clean up font loading
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);
  return (
    <footer className="bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/images/sales_and_offers_logo.svg"
                alt="Sales & Offers Logo"
                width={200}
                height={32}
                className="h-8 w-auto max-w-none"
                style={{ 
                  filter: isDarkMode 
                    ? 'brightness(0) saturate(100%) invert(89%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(89%)' 
                    : 'brightness(0) saturate(100%) invert(9%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(9%) contrast(89%)'
                }}
              />
            </div>
            <p className="text-[rgb(var(--color-muted))]">
              Your trusted marketplace for amazing deals and offers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[rgb(var(--color-fg))]">Quick Links</h4>
            <ul className="space-y-2 text-[rgb(var(--color-muted))]">
              <li><Link href="/offers" className="hover:text-[rgb(var(--color-primary))] transition-colors">Browse Offers</Link></li>
              <li><Link href="/sellers" className="hover:text-[rgb(var(--color-primary))] transition-colors">Sellers</Link></li>
              <li><Link href="/about" className="hover:text-[rgb(var(--color-primary))] transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[rgb(var(--color-fg))]">For Sellers</h4>
            <ul className="space-y-2 text-[rgb(var(--color-muted))]">
              {!isLoggedIn && (
                <li><Link href="/seller/register" className="hover:text-[rgb(var(--color-primary))] transition-colors">Become a Seller</Link></li>
              )}
              <li><Link href="/seller/dashboard" className="hover:text-[rgb(var(--color-primary))] transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-[rgb(var(--color-primary))] transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[rgb(var(--color-fg))]">Support</h4>
            <ul className="space-y-2 text-[rgb(var(--color-muted))]">
              <li><Link href="/help" className="hover:text-[rgb(var(--color-primary))] transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-[rgb(var(--color-primary))] transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-[rgb(var(--color-primary))] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[rgb(var(--color-border))] mt-8 pt-8 text-center text-[rgb(var(--color-muted))]">
          <p>&copy; 2025 Sales & Offers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
