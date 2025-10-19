"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiDollarSign, FiCheckCircle, FiLoader } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface PricingPlan {
  id: number;
  name: string;
  price_ksh: number;
  duration_days: number;
  max_offers: number;
  features: {
    max_offers: number;
    blog_posts: number;
    analytics: string;
    support: string;
    branding: boolean;
    featured_listings: boolean;
    api_access: boolean;
  } | string[];
}

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sellers/subscription-plans/`);
      setPricingPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setLoading(false);
    }
  };

  const getButtonText = (plan: PricingPlan) => {
    if (plan.name === "Basic") return "Start Free";
    if (plan.name === "Pro") return "Choose Pro";
    return "Get Enterprise";
  };

  const isHighlighted = (plan: PricingPlan) => plan.name === "Pro";

  const handleSubscribe = async (planId: number, billingType: 'auto' | 'manual' = 'manual') => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    setSubscribing(planId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/sellers/subscribe/${planId}/`,
        { billing_type: billingType },
        { headers: { Authorization: `Token ${token}` } }
      );

      if (response.data.payment_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.payment_url;
      } else {
        // Free plan activated
        alert("Subscription activated successfully!");
        window.location.href = "/seller/dashboard";
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      alert(error.response?.data?.error || "Subscription failed. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FiDollarSign className="text-purple-600 dark:text-indigo-400 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Flexible Pricing for Every Seller</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
          Choose the plan that best fits your business needs and start growing with Sales & Offers.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800 ${isHighlighted(plan) ? "border-purple-600 ring-4 ring-purple-200 dark:border-indigo-400 dark:ring-indigo-900/40" : ""}`}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{plan.name}</h2>
                <p className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                  KES {plan.price_ksh.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-8">/ month</p>
                
                <ul className="text-left space-y-3 mb-8">
                  {typeof plan.features === 'object' && !Array.isArray(plan.features) ? (
                    <>
                      <li className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                        {plan.features.max_offers === -1 ? 'Unlimited offers' : `${plan.features.max_offers} offers`}
                      </li>
                      <li className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                        {plan.features.blog_posts === -1 ? 'Unlimited blog posts' : `${plan.features.blog_posts} blog posts`}
                      </li>
                      <li className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                        {plan.features.analytics.charAt(0).toUpperCase() + plan.features.analytics.slice(1)} analytics
                      </li>
                      <li className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                        {plan.features.support.charAt(0).toUpperCase() + plan.features.support.slice(1)} support
                      </li>
                      {plan.features.branding && (
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                          Custom branding
                        </li>
                      )}
                      {plan.features.featured_listings && (
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                          Featured listings
                        </li>
                      )}
                      {plan.features.api_access && (
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                          API access
                        </li>
                      )}
                    </>
                  ) : (
                    Array.isArray(plan.features) && plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                        {feature}
                      </li>
                    ))
                  )}
                </ul>

                <div className="space-y-3">
                  {plan.price_ksh > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose billing method:</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSubscribe(plan.id, 'manual')}
                          disabled={subscribing === plan.id}
                        >
                          {subscribing === plan.id ? (
                            <FiLoader className="animate-spin mr-1" />
                          ) : null}
                          Pay Once
                        </Button>
                        <Button
                          variant={isHighlighted(plan) ? "primary" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSubscribe(plan.id, 'auto')}
                          disabled={subscribing === plan.id}
                        >
                          {subscribing === plan.id ? (
                            <FiLoader className="animate-spin mr-1" />
                          ) : null}
                          Auto-Bill
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-billing: Automatically renews monthly. No prepaid cards.
                      </p>
                    </div>
                  )}
                  {plan.price_ksh === 0 && (
                    <Button
                      variant={isHighlighted(plan) ? "primary" : "outline"}
                      size="md"
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id, 'manual')}
                      disabled={subscribing === plan.id}
                    >
                      {subscribing === plan.id ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        getButtonText(plan)
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

