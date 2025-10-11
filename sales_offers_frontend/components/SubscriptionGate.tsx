"use client";

import { useState, useEffect } from "react";
import { FiLock, FiStar, FiTrendingUp } from "react-icons/fi";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";
import { createSubscriptionChecker, UserSubscription } from "../lib/subscription";

interface SubscriptionGateProps {
  feature: 'offers' | 'blog_posts' | 'admin' | 'analytics' | 'branding';
  currentUsage?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export default function SubscriptionGate({ 
  feature, 
  currentUsage = 0, 
  children, 
  fallback,
  showUpgrade = true 
}: SubscriptionGateProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/sellers/stats/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setSubscription(response.data.subscription);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setLoading(false);
    }
  };

  const checker = createSubscriptionChecker(subscription);

  const hasAccess = () => {
    switch (feature) {
      case 'offers':
        return checker.canCreateOffers();
      case 'blog_posts':
        return checker.canCreateBlogPosts(currentUsage);
      case 'admin':
        const isStaff = localStorage.getItem("is_staff") === "true" || localStorage.getItem("is_superuser") === "true";
        return isStaff || checker.getPlanName() === "Enterprise";
      case 'analytics':
        return checker.getAnalyticsLevel() !== 'basic';
      case 'branding':
        return checker.hasFeature('branding');
      default:
        return true;
    }
  };

  const getRestrictionInfo = () => {
    const planName = checker.getPlanName();
    
    switch (feature) {
      case 'offers':
        return {
          title: "Offer Limit Reached",
          message: `You've reached your plan limit. Upgrade to create more offers.`,
          currentPlan: planName,
          suggestedPlan: planName === "Basic" ? "Pro" : "Enterprise"
        };
      case 'blog_posts':
        return {
          title: "Blog Post Limit Reached", 
          message: `You've reached your plan limit. Upgrade to create more blog posts.`,
          currentPlan: planName,
          suggestedPlan: planName === "Basic" ? "Pro" : "Enterprise"
        };
      case 'admin':
        return {
          title: "Admin Access Required",
          message: "Admin dashboard requires Enterprise subscription or staff privileges.",
          currentPlan: planName,
          suggestedPlan: "Enterprise"
        };
      case 'analytics':
        return {
          title: "Advanced Analytics",
          message: "Advanced analytics are available with Pro and Enterprise plans.",
          currentPlan: planName,
          suggestedPlan: "Pro"
        };
      case 'branding':
        return {
          title: "Custom Branding",
          message: "Custom branding is available with Pro and Enterprise plans.",
          currentPlan: planName,
          suggestedPlan: "Pro"
        };
      default:
        return {
          title: "Feature Restricted",
          message: "This feature requires a subscription upgrade.",
          currentPlan: planName,
          suggestedPlan: "Pro"
        };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const restrictionInfo = getRestrictionInfo();

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
      <div className="flex items-start space-x-4">
        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full">
          <FiLock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            {restrictionInfo.title}
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            {restrictionInfo.message}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              Current Plan: <span className="font-medium">{restrictionInfo.currentPlan}</span>
            </div>
            {showUpgrade && (
              <Link href="/pricing">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <FiTrendingUp className="w-4 h-4" />
                  <span>Upgrade to {restrictionInfo.suggestedPlan}</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Usage examples:
// <SubscriptionGate feature="offers" currentUsage={5}>
//   <CreateOfferButton />
// </SubscriptionGate>
//
// <SubscriptionGate feature="blog_posts" currentUsage={3}>
//   <CreateBlogPostForm />
// </SubscriptionGate>
//
// <SubscriptionGate feature="admin">
//   <AdminDashboard />
// </SubscriptionGate>