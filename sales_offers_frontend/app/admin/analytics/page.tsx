"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign, FiCalendar } from "react-icons/fi";
import { api } from "../../../lib/api";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [usersRes, dealsRes, sellersRes] = await Promise.all([
        api.get('/api/accounts/admin/users/'),
        api.get('/api/deals/admin/deals/'),
        api.get('/api/sellers/admin/sellers/')
      ]);
      
      const users = usersRes.data;
      const deals = dealsRes.data;
      const sellers = sellersRes.data;
      
      setMetrics({
        totalClicks: deals.reduce((sum: number, deal: any) => sum + (deal.click_count || 0), 0),
        totalUsers: users.length,
        totalDeals: deals.filter((deal: any) => deal.is_published).length,
        clickThroughRate: 3.2,
        clickGrowth: 18.5,
        userGrowth: 12.3,
        dealGrowth: 8.7
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const [metrics, setMetrics] = useState({
    totalClicks: 0,
    totalUsers: 0,
    totalDeals: 0,
    clickThroughRate: 0,
    clickGrowth: 0,
    userGrowth: 0,
    dealGrowth: 0
  });

  const chartData = [
    { date: "Jan 15", users: 120, clicks: 1800, deals: 8 },
    { date: "Jan 16", users: 135, clicks: 1950, deals: 12 },
    { date: "Jan 17", users: 142, clicks: 2100, deals: 15 },
    { date: "Jan 18", users: 158, clicks: 2250, deals: 18 },
    { date: "Jan 19", users: 167, clicks: 2400, deals: 22 },
    { date: "Jan 20", users: 189, clicks: 2650, deals: 25 },
    { date: "Jan 21", users: 201, clicks: 2850, deals: 28 }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Analytics Dashboard</h1>
            <p className="text-[rgb(var(--color-muted))]">Track performance and key metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-[rgb(var(--color-muted))] w-4 h-4" />
            <select
              className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Total Clicks</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">
                  {loading ? "..." : metrics.totalClicks.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">+{metrics.clickGrowth}%</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Total Users</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">
                  {loading ? "..." : metrics.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">+{metrics.userGrowth}%</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Active Deals</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">
                  {loading ? "..." : metrics.totalDeals}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">+{metrics.dealGrowth}%</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FiShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Click-Through Rate</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">
                  {loading ? "..." : `${metrics.clickThroughRate}%`}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">+0.8%</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <FiTrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Clicks Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-red-500 rounded-t-sm transition-all duration-500 hover:bg-red-600"
                    style={{ height: `${(data.clicks / 3000) * 200}px` }}
                  ></div>
                  <span className="text-xs text-[rgb(var(--color-muted))] mt-2 transform -rotate-45 origin-left">
                    {data.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">User Growth</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                    style={{ height: `${(data.users / 250) * 200}px` }}
                  ></div>
                  <span className="text-xs text-[rgb(var(--color-muted))] mt-2 transform -rotate-45 origin-left">
                    {data.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Top Deals</h3>
            <div className="space-y-4">
              {[
                { name: "iPhone 15 Pro Max Deal", views: 2450, conversions: 89 },
                { name: "Samsung Galaxy S24 Ultra", views: 1890, conversions: 67 },
                { name: "MacBook Air M2 Special", views: 1650, conversions: 45 }
              ].map((deal, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--color-ui))]">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{deal.name}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{deal.views} views • {deal.conversions} clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{((deal.conversions / deal.views) * 100).toFixed(1)}%</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">CTR</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Top Sellers</h3>
            <div className="space-y-4">
              {[
                { name: "TechStore Kenya", revenue: 450000, deals: 12 },
                { name: "Fashion Hub", revenue: 380000, deals: 8 },
                { name: "Home Essentials", revenue: 290000, deals: 15 }
              ].map((seller, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--color-ui))]">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{seller.name}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{seller.deals} active deals</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[rgb(var(--color-fg))]">KES {seller.revenue.toLocaleString()}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">Commission</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}