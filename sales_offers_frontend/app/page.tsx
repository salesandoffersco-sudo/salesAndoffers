"use client";

import Link from "next/link";
import { FiShoppingBag, FiTag, FiTrendingUp, FiUsers } from "react-icons/fi";
import Button from "../components/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] relative">
      {/* Fixed Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Shopping bag icons */}
        <div className="absolute top-16 left-20 text-gray-600/30 dark:text-gray-400/20 text-6xl animate-bounce" style={{animationDuration: '3s'}}>
          🛍️
        </div>
        <div className="absolute top-32 right-16 text-gray-700/25 dark:text-gray-500/15 text-8xl animate-pulse" style={{animationDelay: '1s'}}>
          💰
        </div>
        <div className="absolute bottom-24 left-16 text-gray-600/35 dark:text-gray-400/25 text-5xl animate-bounce" style={{animationDuration: '4s', animationDelay: '2s'}}>
          🏷️
        </div>
        <div className="absolute top-1/2 right-1/4 text-gray-700/30 dark:text-gray-500/20 text-7xl animate-pulse" style={{animationDelay: '3s'}}>
          💳
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute top-40 left-1/3 w-32 h-32 border-2 border-gray-600/20 dark:border-gray-400/10 rounded-lg rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 border-2 border-gray-700/25 dark:border-gray-500/15 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 right-32 w-48 h-48 bg-gray-600/10 dark:bg-gray-400/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-64 h-64 bg-gray-700/15 dark:bg-gray-500/8 rounded-full blur-3xl animate-bounce" style={{animationDuration: '5s'}}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[rgb(var(--color-fg))] mb-6">
            Discover Amazing{" "}
            <span className="text-gradient">
              Deals & Offers
            </span>
          </h1>
          <p className="text-xl text-[rgb(var(--color-muted))] mb-10 max-w-3xl mx-auto">
            Connect with top sellers, explore exclusive offers, and save big on your favorite products. 
            Join thousands of satisfied customers today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/offers" passHref>
              <Button as="a" size="lg" variant="primary">
                Explore Offers
              </Button>
            </Link>
            <Link href="/seller/register" passHref>
              <Button as="a" size="lg" variant="outline">
                List Your Sale
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[rgb(var(--color-card))] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[rgb(var(--color-border))]">
            <div className="bg-[rgba(var(--color-primary),0.1)] w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiTag className="text-[rgb(var(--color-primary))] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Exclusive Deals</h3>
            <p className="text-[rgb(var(--color-muted))]">
              Access exclusive offers and discounts from verified sellers across multiple categories.
            </p>
          </div>

          <div className="bg-[rgb(var(--color-card))] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[rgb(var(--color-border))]">
            <div className="bg-[rgba(var(--color-secondary),0.1)] w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiUsers className="text-[rgb(var(--color-secondary))] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Trusted Sellers</h3>
            <p className="text-[rgb(var(--color-muted))]">
              Shop with confidence from our community of verified and rated sellers.
            </p>
          </div>

          <div className="bg-[rgb(var(--color-card))] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[rgb(var(--color-border))]">
            <div className="bg-[rgba(var(--color-accent),0.1)] w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiTrendingUp className="text-[rgb(var(--color-accent))] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Best Prices</h3>
            <p className="text-[rgb(var(--color-muted))]">
              Compare prices and find the best deals on products you love.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Saving?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our platform today and unlock access to thousands of exclusive offers.
          </p>
          <Link href="/register" passHref>
            <Button as="a" size="lg" variant="outline" className="bg-white text-purple-600 hover:bg-gray-100 border-white">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
