"use client";

import Link from "next/link";
import { FiShoppingBag, FiTag, FiTrendingUp, FiUsers, FiShield, FiStar, FiZap } from "react-icons/fi";
import Button from "../components/Button";
import TrustIndicators from "../components/TrustIndicators";

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-20 right-32 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-tr from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-300/10 to-blue-300/10 rounded-full blur-2xl animate-spin" style={{animationDuration: '15s'}}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-16 left-20 text-purple-500/30 dark:text-purple-400/20 text-6xl animate-float" style={{animationDelay: '0s'}}>
          🛍️
        </div>
        <div className="absolute top-32 right-16 text-blue-500/25 dark:text-blue-400/15 text-8xl animate-float" style={{animationDelay: '1s'}}>
          💰
        </div>
        <div className="absolute bottom-24 left-16 text-purple-600/35 dark:text-purple-400/25 text-5xl animate-float" style={{animationDelay: '2s'}}>
          🏷️
        </div>
        <div className="absolute top-1/2 right-1/4 text-blue-600/30 dark:text-blue-500/20 text-7xl animate-float" style={{animationDelay: '3s'}}>
          💳
        </div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-40 left-1/3 w-32 h-32 border-2 border-purple-500/20 dark:border-purple-400/10 rounded-lg rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 border-2 border-blue-500/25 dark:border-blue-400/15 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 px-4 py-2 rounded-full mb-6 border border-purple-200 dark:border-purple-700">
            <FiShield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Trusted by 50,000+ customers</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[rgb(var(--color-fg))] mb-6 leading-tight">
            Compare Prices{" "}
            <span className="text-gradient bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Across Multiple Stores
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[rgb(var(--color-muted))] mb-8 max-w-4xl mx-auto leading-relaxed">
            Find the best deals from trusted sellers across Jumia, Kilimall, Amazon and more. 
            Compare prices and shop smart with Kenya's premier price comparison platform!
          </p>
          
          {/* Trust Indicators */}
          <div className="mb-10">
            <TrustIndicators size="md" variant="minimal" className="justify-center" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/offers" passHref>
              <Button as="a" size="lg" variant="primary" className="min-w-[200px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <FiZap className="w-5 h-5 mr-2" />
                Browse Deals
              </Button>
            </Link>
            <Link href="/seller/dashboard" passHref>
              <Button as="a" size="lg" variant="outline" className="min-w-[200px] border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300">
                <FiShoppingBag className="w-5 h-5 mr-2" />
                Advertise Now
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
              <div className="text-sm text-[rgb(var(--color-muted))] mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">5K+</div>
              <div className="text-sm text-[rgb(var(--color-muted))] mt-1">Verified Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">10+</div>
              <div className="text-sm text-[rgb(var(--color-muted))] mt-1">Partner Stores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">4.9★</div>
              <div className="text-sm text-[rgb(var(--color-muted))] mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[rgb(var(--color-fg))] mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-[rgb(var(--color-muted))] max-w-3xl mx-auto">
            Experience the future of online shopping with our secure, verified, and user-friendly marketplace
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-[rgb(var(--color-card))] p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-[rgb(var(--color-border))] hover:border-purple-300 dark:hover:border-purple-600 backdrop-shine">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FiTag className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Price Comparison
            </h3>
            <p className="text-[rgb(var(--color-muted))] leading-relaxed">
              Compare prices across multiple stores including Jumia, Kilimall, Amazon and more. Find the best deals with one click.
            </p>
            <div className="mt-4">
              <TrustIndicators size="sm" variant="minimal" showAll={false} />
            </div>
          </div>

          <div className="group bg-[rgb(var(--color-card))] p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-[rgb(var(--color-border))] hover:border-blue-300 dark:hover:border-blue-600 backdrop-shine">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FiUsers className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Trusted Stores
            </h3>
            <p className="text-[rgb(var(--color-muted))] leading-relaxed">
              Shop from Kenya's most trusted online stores. We partner with verified retailers to bring you the best shopping experience.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">100% Verified</span>
            </div>
          </div>

          <div className="group bg-[rgb(var(--color-card))] p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-[rgb(var(--color-border))] hover:border-green-300 dark:hover:border-green-600 backdrop-shine">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FiTrendingUp className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Best Deals
            </h3>
            <p className="text-[rgb(var(--color-muted))] leading-relaxed">
              Never miss a great deal again. Our platform highlights the best prices and helps you save money on every purchase.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <FiStar className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Price Match Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 border border-white/20 rounded-lg rotate-45"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
              <FiStar className="w-4 h-4" />
              <span className="text-sm font-semibold">Join 50,000+ Happy Customers</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Find Better Deals?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Join Kenya's smartest shoppers and start comparing prices across multiple stores to save money on every purchase.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/register" passHref>
                <Button as="a" size="lg" variant="outline" className="bg-white text-purple-600 hover:bg-gray-100 border-white min-w-[200px] font-semibold">
                  <FiZap className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/offers" passHref>
                <Button as="a" size="lg" variant="outline" className="border-white text-white hover:bg-white/10 min-w-[200px] font-semibold">
                  <FiShoppingBag className="w-5 h-5 mr-2" />
                  Compare Prices
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <FiShield className="w-4 h-4" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUsers className="w-4 h-4" />
                <span>Trusted Stores</span>
              </div>
              <div className="flex items-center gap-2">
                <FiStar className="w-4 h-4" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
