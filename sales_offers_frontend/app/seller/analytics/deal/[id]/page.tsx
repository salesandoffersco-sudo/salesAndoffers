'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiDollarSign, FiShoppingBag, FiTarget,
  FiTrendingUp, FiClock, FiStar, FiUsers, FiBarChart
} from 'react-icons/fi';

interface DealAnalytics {
  deal_id: number;
  deal_title: string;
  total_clicks: number;
  estimated_commission: number;
  click_through_rate: number;
  conversion_rate: number;
  daily_clicks?: Array<{
    date: string;
    clicks: number;
  }>;
  store_performance?: {
    best_performing_store: string;
    total_stores: number;
    avg_click_rate: number;
  };
  peak_hours?: Array<{
    hour: string;
    clicks: number;
  }>;
}

const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {Icon && <Icon className="w-6 h-6 text-white" />}
      </div>
    </div>
  </motion.div>
);

export default function DealAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id;

  const [data, setData] = useState<DealAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDealAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://salesandoffers.net'}/api/deals/analytics/deal/${dealId}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError('Failed to fetch deal analytics');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (dealId) {
      fetchDealAnalytics();
    }
  }, [dealId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Unavailable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deal Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 truncate max-w-md">
              {data.deal_title}
            </p>
          </div>
        </motion.div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FiBarChart}
            title="Total Clicks"
            value={data.total_clicks.toLocaleString()}
            color="bg-blue-500"
          />
          <StatCard
            icon={FiDollarSign}
            title="Est. Commission"
            value={`$${data.estimated_commission.toFixed(2)}`}
            color="bg-green-500"
          />
          <StatCard
            icon={FiTarget}
            title="Click-Through Rate"
            value={`${data.click_through_rate.toFixed(1)}%`}
            subtitle="From deal views to clicks"
            color="bg-orange-500"
          />
          <StatCard
            icon={FiTrendingUp}
            title="Performance"
            value={data.click_through_rate > 5 ? "Excellent" : data.click_through_rate > 2 ? "Good" : "Needs Improvement"}
            subtitle={`${data.conversion_rate.toFixed(1)}% conversion`}
            color={data.click_through_rate > 5 ? "bg-green-500" : data.click_through_rate > 2 ? "bg-yellow-500" : "bg-red-500"}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Clicks Chart */}
          {data.daily_clicks && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Clicks Trend</h3>
              <div className="h-64 flex items-end justify-between gap-1">
                {data.daily_clicks.slice(-14).map((day, index) => {
                  const maxClicks = Math.max(...data.daily_clicks!.map(d => d.clicks));
                  const height = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;

                  return (
                    <motion.div
                      key={day.date}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-blue-500 rounded-t flex-1 min-h-[20px] relative group"
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.clicks} clicks
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </motion.div>
          )}

          {/* Store Performance */}
          {data.store_performance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store Performance</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FiShoppingBag className="w-8 h-8 text-blue-500" />
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {data.store_performance.total_stores}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Partner Stores
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Best Performing</span>
                    <span className="font-bold text-green-600">
                      {data.store_performance.best_performing_store}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Avg Click Rate</span>
                    <span className="font-bold text-blue-600">
                      {data.store_performance.avg_click_rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Peak Hours */}
        {data.peak_hours && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Peak Click Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.peak_hours.map((hour, index) => (
                <motion.div
                  key={hour.hour}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{hour.hour}</span>
                  </div>
                  <span className="font-bold text-blue-600">{hour.clicks} clicks</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Insights & Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-xl font-bold mb-4">💡 Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Performance Analysis</h4>
              <p className="text-blue-100">
                {data.click_through_rate > 5
                  ? "Excellent click-through rate! Your deal is highly engaging."
                  : data.click_through_rate > 2
                    ? "Good performance. Consider optimizing deal presentation to boost clicks."
                    : "Low click-through rate. Review your deal title, description, and pricing."
                }
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Growth Opportunities</h4>
              <p className="text-blue-100">
                {data.total_clicks > 100
                  ? "Strong click volume. Consider creating similar deals to replicate success."
                  : "Moderate clicks. Try different categories or promotional timing."
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}