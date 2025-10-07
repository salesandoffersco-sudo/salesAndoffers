"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiDollarSign, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface PricingPlan {
  id: number;
  name: string;
  price_ksh: number;
  duration_days: number;
  max_offers: number;
  features: string[];
}

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (plan.name === "Basic Seller") return "Start Free";
    if (plan.name === "Pro Seller") return "Choose Pro";
    return "Get a Quote";
  };

  const isHighlighted = (plan: PricingPlan) => plan.name === "Pro Seller";

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
                  {plan.name === "Enterprise" ? "KES 9,999" : `KES ${plan.price_ksh}`}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-8">/ month</p>
                
                <ul className="text-left space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                      <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isHighlighted(plan) ? "primary" : "outline"}
                  size="md"
                  className="w-full"
                >
                  {getButtonText(plan)}
                </Button>
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

