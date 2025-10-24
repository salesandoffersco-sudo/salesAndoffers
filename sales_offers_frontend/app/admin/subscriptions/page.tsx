"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiCreditCard, FiUsers, FiTrendingUp, FiDollarSign, FiSearch, FiFilter, FiDownload } from "react-icons/fi";
import { api } from "../../../lib/api";

interface Subscription {
  id: number;
  user: {
    username: string;
    email: string;
  };
  plan: {
    name: string;
    price_ksh: number;
  };
  status: string;
  start_date: string;
  end_date: string;
  billing_type: string;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0,
    growth: 0
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/api/sellers/admin/subscriptions/');
      const data = response.data;
      
      setSubscriptions(data);
      setStats({
        total: data.length,
        active: data.filter((s: any) => s.status === 'active').length,
        revenue: data.reduce((sum: number, s: any) => sum + s.plan.price_ksh, 0),
        growth: 15.2
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Subscriptions</h1>
            <p className="text-[rgb(var(--color-muted))]">Manage user subscriptions and billing</p>
          </div>
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            <FiDownload className="w-4 h-4" />
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Total Subscriptions</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FiCreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Active Subscriptions</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.active}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <FiUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Monthly Revenue</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">KES {stats.revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FiDollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Growth Rate</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">+{stats.growth}%</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FiTrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="text-[rgb(var(--color-muted))]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Billing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[rgb(var(--color-muted))]">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--color-fg))]">{subscription.user.username}</div>
                          <div className="text-sm text-[rgb(var(--color-muted))]">{subscription.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[rgb(var(--color-fg))]">{subscription.plan.name}</div>
                        <div className="text-sm text-[rgb(var(--color-muted))]">KES {subscription.plan.price_ksh}/month</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[rgb(var(--color-fg))] capitalize">{subscription.billing_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[rgb(var(--color-fg))]">
                          {new Date(subscription.start_date).toLocaleDateString()} - {new Date(subscription.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[rgb(var(--color-fg))]">KES {subscription.plan.price_ksh.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}