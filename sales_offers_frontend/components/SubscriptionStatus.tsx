"use client";

import { useState, useEffect } from "react";
import { FiStar, FiTrendingUp, FiLock, FiCheck } from "react-icons/fi";
import Link from "next/link";
import { api } from "../lib/api";

interface SubscriptionStatusProps {
  showDetails?: boolean;
  compact?: boolean;
}

export default function SubscriptionStatus({ showDetails = true, compact = false }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const [statsRes, postsRes] = await Promise.all([
        api.get('/api/sellers/stats/'),
        api.get('/api/blog/posts/').catch(() => ({ data: [] }))
      ]);

      const userPosts = postsRes.data.filter((post: any) => 
        post.author.username === localStorage.getItem("username")
      );

      setSubscription(statsRes.data.subscription);
      setUsage({
        offers: statsRes.data.active_offers,
        blogPosts: userPosts.length
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      setLoading(false);
    }
  };

  const getFeatureLimits = () => {
    if (!subscription?.plan?.features) {
      return {
        offers: { max: 1, current: usage?.offers || 0 },
        blogPosts: { max: 2, current: usage?.blogPosts || 0 },
        analytics: 'basic',
        support: 'email',
        branding: false,
        featuredListings: false,
        apiAccess: false
      };
    }

    const features = subscription.plan.features;
    return {
      offers: { max: features.max_offers, current: usage?.offers || 0 },
      blogPosts: { max: features.blog_posts, current: usage?.blogPosts || 0 },
      analytics: features.analytics,
      support: features.support,
      branding: features.branding,
      featuredListings: features.featured_listings,
      apiAccess: features.api_access
    };
  };

  const getUsageColor = (current: number, max: number) => {
    if (max === -1) return "text-green-600 dark:text-green-400";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600 dark:text-red-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getProgressWidth = (current: number, max: number) => {
    if (max === -1) return "100%";
    return `${Math.min((current / max) * 100, 100)}%`;
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">No Active Subscription</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Subscribe to unlock more features</p>
          </div>
          <Link href="/pricing">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              View Plans
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const limits = getFeatureLimits();
  const planName = subscription.plan_name || "No Plan";

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <FiStar className="w-4 h-4" />
              <span className="font-medium">{planName}</span>
            </div>
            <div className="text-sm opacity-90 mt-1">
              {limits.offers.max === -1 ? 'Unlimited' : `${limits.offers.current}/${limits.offers.max}`} offers
            </div>
          </div>
          <Link href="/pricing">
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors">
              Upgrade
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
            <FiStar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{planName} Plan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current subscription status</p>
          </div>
        </div>
        <Link href="/pricing">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
            <FiTrendingUp className="w-4 h-4" />
            <span>Upgrade</span>
          </button>
        </Link>
      </div>

      {showDetails && (
        <div className="space-y-4">
          {/* Usage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Offers</span>
                <span className={`text-sm font-medium ${getUsageColor(limits.offers.current, limits.offers.max)}`}>
                  {limits.offers.max === -1 ? `${limits.offers.current}/∞` : `${limits.offers.current}/${limits.offers.max}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: getProgressWidth(limits.offers.current, limits.offers.max) }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blog Posts</span>
                <span className={`text-sm font-medium ${getUsageColor(limits.blogPosts.current, limits.blogPosts.max)}`}>
                  {limits.blogPosts.max === -1 ? `${limits.blogPosts.current}/∞` : `${limits.blogPosts.current}/${limits.blogPosts.max}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: getProgressWidth(limits.blogPosts.current, limits.blogPosts.max) }}
                ></div>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{limits.analytics} analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{limits.support} support</span>
            </div>
            <div className="flex items-center space-x-2">
              {limits.branding ? (
                <FiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <FiLock className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm ${limits.branding ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                Custom branding
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {limits.featuredListings ? (
                <FiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <FiLock className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm ${limits.featuredListings ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                Featured listings
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {limits.apiAccess ? (
                <FiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <FiLock className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm ${limits.apiAccess ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                API access
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}