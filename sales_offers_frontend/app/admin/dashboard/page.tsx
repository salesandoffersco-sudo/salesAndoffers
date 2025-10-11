"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { 
  FiUsers, FiTag, FiShoppingBag, FiMail, FiTrendingUp, 
  FiDollarSign, FiActivity, FiAlertCircle 
} from "react-icons/fi";

interface DashboardStats {
  totalUsers: number;
  totalDeals: number;
  totalSellers: number;
  newsletterSubscribers: number;
  revenue: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDeals: 0,
    totalSellers: 0,
    newsletterSubscribers: 0,
    revenue: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalDeals: 89,
        totalSellers: 156,
        newsletterSubscribers: 892,
        revenue: 45670,
        activeUsers: 234
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "blue",
      change: "+12%"
    },
    {
      title: "Active Deals",
      value: stats.totalDeals,
      icon: FiTag,
      color: "green",
      change: "+8%"
    },
    {
      title: "Sellers",
      value: stats.totalSellers,
      icon: FiShoppingBag,
      color: "purple",
      change: "+15%"
    },
    {
      title: "Newsletter Subs",
      value: stats.newsletterSubscribers,
      icon: FiMail,
      color: "orange",
      change: "+23%"
    },
    {
      title: "Revenue",
      value: `KES ${stats.revenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: "red",
      change: "+18%"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: FiActivity,
      color: "indigo",
      change: "+5%"
    }
  ];

  const recentActivities = [
    { id: 1, action: "New user registered", user: "john@example.com", time: "2 minutes ago" },
    { id: 2, action: "Deal created", user: "seller123", time: "5 minutes ago" },
    { id: 3, action: "Newsletter subscription", user: "jane@example.com", time: "10 minutes ago" },
    { id: 4, action: "User verification", user: "mike@example.com", time: "15 minutes ago" },
    { id: 5, action: "Deal approved", user: "admin", time: "20 minutes ago" }
  ];

  const alerts = [
    { id: 1, type: "warning", message: "Server CPU usage is high (85%)", time: "5 min ago" },
    { id: 2, type: "info", message: "Weekly backup completed successfully", time: "1 hour ago" },
    { id: 3, type: "error", message: "Failed email delivery to 3 subscribers", time: "2 hours ago" }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Dashboard Overview</h1>
            <p className="text-[rgb(var(--color-muted))]">Welcome to the admin dashboard</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-[rgb(var(--color-muted))]">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>System Online</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--color-muted))]">{stat.title}</p>
                  <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">
                    {loading ? "..." : stat.value}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-[rgb(var(--color-ui))]">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{activity.action}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">System Alerts</h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                  alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <FiAlertCircle className={`w-4 h-4 mt-0.5 ${
                    alert.type === 'error' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{alert.message}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center rounded-lg bg-[rgb(var(--color-ui))] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
              <FiUsers className="w-6 h-6 mx-auto mb-2 text-[rgb(var(--color-muted))] group-hover:text-red-600" />
              <span className="text-sm font-medium text-[rgb(var(--color-fg))]">Manage Users</span>
            </button>
            <button className="p-4 text-center rounded-lg bg-[rgb(var(--color-ui))] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
              <FiTag className="w-6 h-6 mx-auto mb-2 text-[rgb(var(--color-muted))] group-hover:text-red-600" />
              <span className="text-sm font-medium text-[rgb(var(--color-fg))]">Review Deals</span>
            </button>
            <button className="p-4 text-center rounded-lg bg-[rgb(var(--color-ui))] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
              <FiMail className="w-6 h-6 mx-auto mb-2 text-[rgb(var(--color-muted))] group-hover:text-red-600" />
              <span className="text-sm font-medium text-[rgb(var(--color-fg))]">Send Newsletter</span>
            </button>
            <button className="p-4 text-center rounded-lg bg-[rgb(var(--color-ui))] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
              <FiTrendingUp className="w-6 h-6 mx-auto mb-2 text-[rgb(var(--color-muted))] group-hover:text-red-600" />
              <span className="text-sm font-medium text-[rgb(var(--color-fg))]">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}