'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiEye,
  FiArrowUp, FiArrowDown, FiBarChart, FiChevronRight
} from 'react-icons/fi';

interface AnalyticsData {
  totalClicks: number;
  monthlyClicks: number;
  totalDeals: number;
  activeDeals: number;
  clickThroughRate: number;
  growth: number;
  plan: string;
  estimatedCommission: number;
}

interface AnalyticsWidgetProps {
  className?: string;
}

const MiniStatCard = ({ icon: Icon, label, value, change, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {Icon && <Icon className="w-4 h-4 text-white" />}
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
    {change !== undefined && (
      <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
        {Math.abs(change)}%
      </div>
    )}
  </motion.div>
);

export default function AnalyticsWidget({ className = '' }: AnalyticsWidgetProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsPreview = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://salesandoffers.net'}/api/sellers/stats/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setData({
            totalClicks: result.total_clicks || 0,
            monthlyClicks: result.monthly_clicks || 0,
            totalDeals: result.total_offers || 0,
            activeDeals: result.active_offers || 0,
            clickThroughRate: result.click_through_rate || 0,
            growth: result.click_growth || 0,
            plan: result.subscription?.plan_name || 'Basic',
            estimatedCommission: result.estimated_commission || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsPreview();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiBarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Affiliate Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your click performance at a glance</p>
            </div>
          </div>
          <Link
            href="/seller/analytics"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
            <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 space-y-4">
        <MiniStatCard
          icon={FiDollarSign}
          label="Est. Commission"
          value={`$${(data?.estimatedCommission || 0).toFixed(2)}`}
          change={data?.growth}
          color="bg-green-500"
        />

        <MiniStatCard
          icon={FiBarChart}
          label="Total Clicks"
          value={data?.totalClicks || 0}
          color="bg-blue-500"
        />

        {data?.plan !== 'Basic' && (
          <MiniStatCard
            icon={FiTrendingUp}
            label="Click-Through Rate"
            value={`${(data?.clickThroughRate || 0).toFixed(1)}%`}
            change={5.2}
            color="bg-purple-500"
          />
        )}

        {/* Plan-specific features */}
        {data?.plan === 'Basic' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <FiEye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Unlock Advanced Analytics
              </span>
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-400 mb-3">
              Get detailed insights, click tracking, and commission analytics
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700"
            >
              Upgrade Now
              <FiChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/seller/analytics"
            className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
          >
            <FiBarChart className="w-4 h-4" />
            Full Analytics
          </Link>
          <button className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
            <FiTrendingUp className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>
    </motion.div>
  );
}