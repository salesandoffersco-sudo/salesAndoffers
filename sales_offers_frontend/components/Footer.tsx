"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NewsletterSubscription from "./NewsletterSubscription";
import { API_BASE_URL } from "../lib/api";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);

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
      if (token) {
        fetchSellerProfile();
      }
    };

    const fetchSellerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${API_BASE_URL}/api/sellers/profile/`, {
            headers: { Authorization: `Token ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setSellerProfile(data);
          }
        }
      } catch (error) {
        console.error("Error fetching seller profile:", error);
      }
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
      <div className="max-w-7xl mx-auto" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div style={{ marginBottom: '1rem', width: 'fit-content' }}>
              <Image
                src="/images/sales_and_offers_logo.svg"
                alt="Sales & Offers Logo"
                width={280}
                height={44}
                className="h-8 w-auto"
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
              <li><Link href="/blog" className="hover:text-[rgb(var(--color-primary))] transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-[rgb(var(--color-primary))] transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[rgb(var(--color-fg))]">Selling</h4>
            <ul className="space-y-2 text-[rgb(var(--color-muted))]">
              <li><Link href="/seller/dashboard" className="hover:text-[rgb(var(--color-primary))] transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/subscription" className="hover:text-[rgb(var(--color-primary))] transition-colors">Subscription Plans</Link></li>
              <li><Link href="/pricing" className="hover:text-[rgb(var(--color-primary))] transition-colors">Pricing</Link></li>
              {(!sellerProfile || !sellerProfile.is_published) && (
                <li><Link href="/seller/profile" className="hover:text-[rgb(var(--color-primary))] transition-colors">Start Selling</Link></li>
              )}
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
        {/* Newsletter Subscription */}
        <div className="border-t border-[rgb(var(--color-border))] mt-8 pt-8">
          <div className="max-w-md mx-auto text-center mb-6">
            <h4 className="font-semibold mb-2 text-[rgb(var(--color-fg))]">Stay Updated</h4>
            <p className="text-[rgb(var(--color-muted))] text-sm mb-4">
              Subscribe to our newsletter for the latest deals and offers
            </p>
            <NewsletterSubscription />
          </div>
          <div className="text-center text-[rgb(var(--color-muted))]">
            <p>&copy; 2025 Sales & Offers. All rights reserved. Developed with ❤️ by <a href="https://share.google/N0nYLmdcczEb5dgbS" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--color-primary))] transition-colors">gurucrafts agency</a>.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
