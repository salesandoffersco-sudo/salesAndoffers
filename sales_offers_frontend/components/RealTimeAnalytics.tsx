'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiDollarSign, FiShoppingBag, FiUsers, 
  FiTrendingUp, FiZap, FiWifi, FiWifiOff
} from 'react-icons/fi';

interface RealTimeData {
  currentRevenue: number;
  todaysSales: number;
  activeUsers: number;
  recentActivity: Array<{
    id: string;
    type: 'sale' | 'redemption' | 'view';
    message: string;
    timestamp: Date;
    amount?: number;
  }>;
}

interface RealTimeAnalyticsProps {
  plan: string;
  className?: string;
}

const ActivityItem = ({ activity, index }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
  >
    <div className={`p-2 rounded-full ${
      activity.type === 'sale' ? 'bg-green-100 dark:bg-green-900/30' :
      activity.type === 'redemption' ? 'bg-blue-100 dark:bg-blue-900/30' :
      'bg-purple-100 dark:bg-purple-900/30'
    }`}>
      {activity.type === 'sale' ? (
        <FiDollarSign className={`w-4 h-4 ${
          activity.type === 'sale' ? 'text-green-600 dark:text-green-400' :
          activity.type === 'redemption' ? 'text-blue-600 dark:text-blue-400' :
          'text-purple-600 dark:text-purple-400'
        }`} />
      ) : activity.type === 'redemption' ? (
        <FiShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      ) : (
        <FiUsers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      )}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
      <p className="text-xs text-gray-500">
        {activity.timestamp.toLocaleTimeString()}
        {activity.amount && (
          <span className="ml-2 font-medium text-green-600">
            +KES {activity.amount.toLocaleString()}
          </span>
        )}
      </p>
    </div>
  </motion.div>
);

const LiveMetric = ({ icon: Icon, label, value, color, pulse = false }: any) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${
      pulse ? 'animate-pulse' : ''
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    {pulse && (
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
      </div>
    )}
  </motion.div>
);

export default function RealTimeAnalytics({ plan, className = '' }: RealTimeAnalyticsProps) {
  const [data, setData] = useState<RealTimeData>({
    currentRevenue: 0,
    todaysSales: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  // Simulate real-time data updates
  useEffect(() => {
    if (plan === 'Basic') return; // Real-time only for Pro/Enterprise

    const simulateRealTimeData = () => {
      const activities = [
        { type: 'sale', message: 'New voucher purchased for "50% Off Electronics"', amount: 2500 },
        { type: 'redemption', message: 'Voucher redeemed at Tech Store Downtown' },
        { type: 'view', message: '5 new customers viewed your deals' },
        { type: 'sale', message: 'Bulk purchase: 3 vouchers for "Restaurant Special"', amount: 4500 },
        { type: 'redemption', message: 'Voucher redeemed at Fashion Outlet' }
      ];

      setData(prev => {
        const newActivity = activities[Math.floor(Math.random() * activities.length)];
        const updatedActivity = {
          ...newActivity,
          id: Date.now().toString(),
          timestamp: new Date()
        };

        return {
          currentRevenue: prev.currentRevenue + (newActivity.amount || 0),
          todaysSales: prev.todaysSales + (newActivity.type === 'sale' ? 1 : 0),
          activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
          recentActivity: [updatedActivity, ...prev.recentActivity.slice(0, 4)]
        };
      });

      setLastUpdate(new Date());
      setConnected(true);
    };

    // Initial data
    setData({
      currentRevenue: 12500,
      todaysSales: 8,
      activeUsers: 23,
      recentActivity: []
    });

    // Simulate updates every 5-15 seconds
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 10000; // 5-15 seconds
      intervalRef.current = setTimeout(() => {
        simulateRealTimeData();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [plan]);

  if (plan === 'Basic') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiZap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Real-Time Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get live updates on sales, customer activity, and performance metrics
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiActivity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Analytics</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {connected ? (
                  <>
                    <FiWifi className="w-4 h-4 text-green-500" />
                    <span>Connected • Last update {lastUpdate.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <FiWifiOff className="w-4 h-4 text-red-500" />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <LiveMetric
            icon={FiDollarSign}
            label="Today's Revenue"
            value={`KES ${data.currentRevenue.toLocaleString()}`}
            color="bg-green-500"
            pulse={data.currentRevenue > 0}
          />
          <LiveMetric
            icon={FiShoppingBag}
            label="Today's Sales"
            value={data.todaysSales}
            color="bg-blue-500"
          />
          <LiveMetric
            icon={FiUsers}
            label="Active Users"
            value={data.activeUsers}
            color="bg-purple-500"
          />
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <FiActivity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Waiting for activity...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}