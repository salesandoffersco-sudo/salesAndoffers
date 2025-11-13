'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, 
  FiBarChart, FiPieChart, FiActivity, FiTarget,
  FiArrowUp, FiArrowDown, FiEye, FiRefreshCw, FiDownload
} from 'react-icons/fi';
import dynamic from 'next/dynamic';

const RealTimeAnalytics = dynamic(() => import('../../../components/RealTimeAnalytics'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
});

const AnalyticsExport = dynamic(() => import('../../../components/AnalyticsExport'), {
  ssr: false
});

interface AnalyticsData {
  plan: string;
  analytics: {
    total_deals: number;
    active_deals: number;
    total_clicks: number;
    monthly_clicks: number;
    estimated_commission: number;
    click_through_rate?: number;
    avg_commission_per_click?: number;
    top_performing_deals?: Array<{
      id: number;
      title: string;
      clicks: number;
      commission: number;
    }>;
    daily_clicks_chart?: Array<{
      date: string;
      clicks: number;
    }>;
    category_performance?: Array<{
      category: string;
      deals: number;
      clicks: number;
    }>;
    traffic_sources?: {
      direct: number;
      social: number;
      search: number;
    };
  };
}

const StatCard = ({ icon: Icon, title, value, change, color, isLoading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <div className="flex items-center mt-2">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
          {change && (
            <span className={`ml-2 flex items-center text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, isLoading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    {isLoading ? (
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    ) : (
      children
    )}
  </motion.div>
);

const PlanBadge = ({ plan }: { plan: string }) => {
  const colors = {
    Basic: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[plan as keyof typeof colors] || colors.Basic}`}>
      {plan} Plan
    </span>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
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

  const fetchAnalytics = async () => {
    try {
      if (!mounted) return;
      
      const token = localStorage?.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://salesandoffers.onrender.com'}/api/deals/analytics/seller/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  useEffect(() => {
    if (mounted) {
      fetchAnalytics();
    }
  }, [mounted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <StatCard key={i} isLoading={true} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Unavailable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const analytics = data?.analytics;
  const plan = data?.plan || 'Basic';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Affiliate Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your clicks, commissions, and performance</p>
          </div>
          <div className="flex items-center gap-4">
            <PlanBadge plan={plan} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FiShoppingBag}
            title="Total Deals"
            value={analytics?.total_deals || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={FiBarChart}
            title="Total Clicks"
            value={(analytics?.total_clicks || 0).toLocaleString()}
            color="bg-green-500"
          />
          <StatCard
            icon={FiDollarSign}
            title="Est. Commission"
            value={`$${(analytics?.estimated_commission || 0).toFixed(2)}`}
            color="bg-purple-500"
          />
          <StatCard
            icon={FiTrendingUp}
            title="Monthly Clicks"
            value={analytics?.monthly_clicks || 0}
            color="bg-orange-500"
          />
        </div>

        {/* Enhanced Stats for Pro/Enterprise */}
        {plan !== 'Basic' && analytics?.click_through_rate !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={FiActivity}
              title="Click-Through Rate"
              value={`${(analytics.click_through_rate || 0).toFixed(1)}%`}
              color="bg-emerald-500"
            />
            <StatCard
              icon={FiDollarSign}
              title="Avg Commission/Click"
              value={`$${(analytics.avg_commission_per_click || 0).toFixed(3)}`}
              color="bg-indigo-500"
            />
            <StatCard
              icon={FiEye}
              title="Active Deals"
              value={analytics.active_deals || 0}
              color="bg-pink-500"
            />
            <StatCard
              icon={FiTarget}
              title="Conversion Rate"
              value={`${((analytics.monthly_clicks / (analytics.total_clicks || 1)) * 100).toFixed(1)}%`}
              color="bg-cyan-500"
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clicks Chart - Enterprise Only */}
          {plan === 'Enterprise' && analytics?.daily_clicks_chart && (
            <ChartCard title="Daily Clicks Trend">
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.daily_clicks_chart.slice(-14).map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((day.clicks / Math.max(...analytics.daily_clicks_chart!.map(d => d.clicks))) * 100, 5)}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-blue-500 rounded-t flex-1 min-h-[20px] relative group"
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.clicks} clicks
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </ChartCard>
          )}

          {/* Top Deals - Pro/Enterprise */}
          {plan !== 'Basic' && analytics?.top_performing_deals && (
            <ChartCard title="Top Performing Deals">
              <div className="space-y-4">
                {analytics.top_performing_deals.slice(0, 5).map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {deal.title}
                      </p>
                      <p className="text-sm text-gray-500">{deal.clicks} clicks</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${deal.commission.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>

        {/* Category Performance - Enterprise Only */}
        {plan === 'Enterprise' && analytics?.category_performance && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Category Performance">
              <div className="space-y-4">
                {analytics.category_performance.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.deals} deals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{category.clicks} clicks</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ChartCard>

            {/* Traffic Sources */}
            {analytics.traffic_sources && (
              <ChartCard title="Traffic Sources">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {(analytics.traffic_sources.direct + analytics.traffic_sources.social + analytics.traffic_sources.search).toLocaleString()}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Total Visitors</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Direct Traffic</span>
                      <span className="font-bold text-green-600">{analytics.traffic_sources.direct}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Social Media</span>
                      <span className="font-bold text-blue-600">{analytics.traffic_sources.social}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Search Engines</span>
                      <span className="font-bold text-purple-600">{analytics.traffic_sources.search}%</span>
                    </div>
                  </div>
                </div>
              </ChartCard>
            )}
          </div>
        )}

        {/* Real-Time Analytics - Pro/Enterprise */}
        {plan !== 'Basic' && (
          <div className="mb-8">
            <RealTimeAnalytics plan={plan} />
          </div>
        )}

        {/* Plan Upgrade CTA for Basic users */}
        {plan === 'Basic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center"
          >
            <FiTrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Unlock Advanced Analytics</h3>
            <p className="mb-6 opacity-90">
              Get detailed insights, click trends, and commission analytics with Pro or Enterprise plans
            </p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </motion.div>
        )}
      </div>

      {/* Export Modal */}
      <AnalyticsExport
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        plan={plan}
      />
    </div>
  );
}