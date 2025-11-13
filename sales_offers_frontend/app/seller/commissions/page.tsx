'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiDownload } from 'react-icons/fi';

interface Commission {
  id: number;
  deal_title: string;
  clicks: number;
  commission: number;
  date: string;
  status: 'pending' | 'paid';
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Mock data for now
      setCommissions([
        {
          id: 1,
          deal_title: 'Sample Deal',
          clicks: 25,
          commission: 1.25,
          date: '2024-01-15',
          status: 'paid'
        }
      ]);
      setLoading(false);
    }
  }, [mounted]);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commissions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your affiliate earnings</p>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission History</h3>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{commission.deal_title}</p>
                    <p className="text-sm text-gray-500">{commission.clicks} clicks • {commission.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${commission.commission.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      commission.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commission.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}