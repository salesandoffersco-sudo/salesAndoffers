'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, 
  FiBarChart, FiPieChart, FiActivity, FiTarget,
  FiArrowUp, FiArrowDown, FiEye, FiLock
} from 'react-icons/fi';

interface AnalyticsOverviewProps {
  plan: string;
  className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, available, upgradeUrl }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${
      !available ? 'opacity-60' : ''
    }`}
  >
    {!available && (
      <div className="absolute top-4 right-4">
        <FiLock className="w-5 h-5 text-gray-400" />
      </div>
    )}
    
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-lg ${available ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
        <Icon className={`w-6 h-6 ${available ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
        
        {available ? (
          <Link href="/seller/analytics" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Details →
          </Link>
        ) : (
          <Link href={upgradeUrl} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Upgrade to Unlock →
          </Link>
        )}
      </div>
    </div>
  </motion.div>
);

export default function AnalyticsOverview({ plan, className = '' }: AnalyticsOverviewProps) {
  const [quickStats, setQuickStats] = useState({
    totalRevenue: 0,
    totalDeals: 0,
    conversionRate: 0,
    growth: 0
  });

  const features = [
    {
      icon: FiBarChart,
      title: 'Revenue Analytics',
      description: 'Track your earnings, daily revenue trends, and financial performance over time.',
      available: true
    },
    {
      icon: FiTrendingUp,
      title: 'Performance Metrics',
      description: 'Monitor conversion rates, deal performance, and customer engagement metrics.',
      available: plan !== 'Basic'
    },
    {
      icon: FiPieChart,
      title: 'Category Insights',
      description: 'Analyze which product categories perform best and optimize your offerings.',
      available: plan === 'Enterprise'
    },
    {
      icon: FiUsers,
      title: 'Customer Analytics',
      description: 'Understand your customer demographics, behavior patterns, and retention rates.',
      available: plan === 'Enterprise'
    },
    {
      icon: FiActivity,
      title: 'Real-time Monitoring',
      description: 'Get live updates on sales, redemptions, and customer activity as it happens.',
      available: plan !== 'Basic'
    },
    {
      icon: FiTarget,
      title: 'Competitive Analysis',
      description: 'Compare your performance against market trends and competitor insights.',
      available: plan === 'Enterprise'
    }
  ];

  useEffect(() => {
    // Simulate fetching quick stats
    setQuickStats({
      totalRevenue: 45000,
      totalDeals: 12,
      conversionRate: 24.5,
      growth: 12.3
    });
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Revenue</p>
              <p className="text-2xl font-bold">KES {quickStats.totalRevenue.toLocaleString()}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Deals</p>
              <p className="text-2xl font-bold">{quickStats.totalDeals}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Conversion</p>
              <p className="text-2xl font-bold">{quickStats.conversionRate}%</p>
            </div>
            <FiTarget className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Growth</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold">+{quickStats.growth}%</p>
                <FiArrowUp className="w-4 h-4" />
              </div>
            </div>
            <FiTrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Plan Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Features</h2>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          plan === 'Enterprise' 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
            : plan === 'Pro'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {plan} Plan
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            available={feature.available}
            upgradeUrl="/pricing"
          />
        ))}
      </div>

      {/* CTA Section */}
      {plan === 'Basic' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center"
        >
          <FiBarChart className="w-16 h-16 mx-auto mb-4 text-white/80" />
          <h3 className="text-2xl font-bold mb-2">Unlock Advanced Analytics</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Get detailed insights into your business performance, customer behavior, and market trends. 
            Make data-driven decisions to grow your revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Upgrade to Pro
            </Link>
            <Link href="/seller/analytics" className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
              View Basic Analytics
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}