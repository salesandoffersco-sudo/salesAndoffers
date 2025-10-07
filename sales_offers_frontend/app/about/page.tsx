"use client";

import Link from "next/link";
import { FiShoppingBag, FiUsers, FiTrendingUp, FiHeart } from "react-icons/fi";
import Button from "../../components/Button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About Sales & Offers</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Connecting buyers and sellers through amazing deals and trusted relationships
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[rgb(var(--color-fg))] mb-6">Our Mission</h2>
          <p className="text-xl text-[rgb(var(--color-muted))] max-w-4xl mx-auto">
            We believe everyone deserves access to great deals and quality products. Our platform bridges the gap between 
            sellers offering amazing discounts and buyers looking for the best value for their money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[rgb(var(--color-card))] p-8 rounded-2xl shadow-lg border border-[rgb(var(--color-border))] text-center">
            <div className="bg-[rgba(var(--color-primary),0.1)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUsers className="text-[rgb(var(--color-primary))] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Community First</h3>
            <p className="text-[rgb(var(--color-muted))]">
              Building a trusted community where buyers and sellers can connect with confidence and transparency.
            </p>
          </div>

          <div className="bg-[rgb(var(--color-card))] p-8 rounded-2xl shadow-lg border border-[rgb(var(--color-border))] text-center">
            <div className="bg-[rgba(var(--color-secondary),0.1)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrendingUp className="text-[rgb(var(--color-secondary))] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Growth Together</h3>
            <p className="text-[rgb(var(--color-muted))]">
              Empowering sellers to grow their business while helping buyers discover incredible deals and savings.
            </p>
          </div>

          <div className="bg-[rgb(var(--color-card))] p-8 rounded-2xl shadow-lg border border-[rgb(var(--color-border))] text-center">
            <div className="bg-[rgba(var(--color-accent),0.1)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="text-[rgb(var(--color-accent))] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Customer Love</h3>
            <p className="text-[rgb(var(--color-muted))]">
              Putting customer satisfaction at the heart of everything we do, ensuring the best experience for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[rgb(var(--color-card))] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[rgb(var(--color-primary))] mb-2">1000+</div>
              <div className="text-[rgb(var(--color-muted))]">Active Sellers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[rgb(var(--color-secondary))] mb-2">50K+</div>
              <div className="text-[rgb(var(--color-muted))]">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[rgb(var(--color-accent))] mb-2">100K+</div>
              <div className="text-[rgb(var(--color-muted))]">Deals Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[rgb(var(--color-primary))] mb-2">95%</div>
              <div className="text-[rgb(var(--color-muted))]">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're looking for great deals or want to start selling, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/offers">
              <Button size="lg" variant="outline" className="bg-white text-purple-600 hover:bg-gray-100 border-white">
                Browse Offers
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}