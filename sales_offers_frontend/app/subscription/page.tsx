"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiCreditCard, FiCalendar, FiCheckCircle, FiXCircle, FiSettings } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface Subscription {
  id: number;
  plan: {
    id: number;
    name: string;
    price_ksh: number;
    duration_days: number;
    max_offers: number;
    features: string[];
  };
  status: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/sellers/subscription/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setSubscription(response.data);
      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSubscription(null);
      }
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/sellers/cancel-subscription/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      alert("Subscription cancelled successfully");
      fetchSubscription();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <FiCreditCard className="text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">My Subscription</h1>
              <p className="text-xl opacity-90">Manage your subscription plan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!subscription ? (
          <div className="text-center py-20">
            <FiCreditCard className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">No Active Subscription</h2>
            <p className="text-[rgb(var(--color-muted))] mb-6">
              Choose a subscription plan to start selling on our platform
            </p>
            <Link href="/pricing">
              <Button variant="primary">View Plans</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{subscription.plan.name}</h2>
                    <p className="opacity-90">Current Plan</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FiCalendar className="text-[rgb(var(--color-muted))]" />
                      <span className="font-semibold text-[rgb(var(--color-text))]">Start Date</span>
                    </div>
                    <p className="text-[rgb(var(--color-muted))]">{formatDate(subscription.start_date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FiCalendar className="text-[rgb(var(--color-muted))]" />
                      <span className="font-semibold text-[rgb(var(--color-text))]">End Date</span>
                    </div>
                    <p className="text-[rgb(var(--color-muted))]">{formatDate(subscription.end_date)}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-[rgb(var(--color-text))] mb-3">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="text-green-500" />
                      <span className="text-[rgb(var(--color-text))]">Up to {subscription.plan.max_offers} offers</span>
                    </div>
                    {subscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FiCheckCircle className="text-green-500" />
                        <span className="text-[rgb(var(--color-text))]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Link href="/pricing">
                    <Button variant="primary">
                      <FiSettings className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                  {subscription.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {cancelling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] p-6">
              <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mb-4">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-[rgb(var(--color-text))]">Plan Price:</span>
                  <p className="text-[rgb(var(--color-muted))]">KES {subscription.plan.price_ksh}/month</p>
                </div>
                <div>
                  <span className="font-semibold text-[rgb(var(--color-text))]">Duration:</span>
                  <p className="text-[rgb(var(--color-muted))]">{subscription.plan.duration_days} days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}