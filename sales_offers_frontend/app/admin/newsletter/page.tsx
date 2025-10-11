"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiMail, FiUsers, FiSend, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

interface Campaign {
  id: number;
  subject: string;
  status: "draft" | "sent" | "scheduled";
  recipients: number;
  openRate: number;
  clickRate: number;
  sentAt?: string;
}

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");

  useEffect(() => {
    setTimeout(() => {
      setSubscribers([
        { id: 1, email: "john@example.com", subscribedAt: "2024-01-15", isActive: true },
        { id: 2, email: "jane@example.com", subscribedAt: "2024-01-18", isActive: true },
        { id: 3, email: "mike@example.com", subscribedAt: "2024-01-20", isActive: false }
      ]);
      setCampaigns([
        { id: 1, subject: "Weekly Deals Update", status: "sent", recipients: 892, openRate: 24.5, clickRate: 3.2, sentAt: "2024-01-20" },
        { id: 2, subject: "New Year Special Offers", status: "sent", recipients: 856, openRate: 31.2, clickRate: 5.8, sentAt: "2024-01-01" },
        { id: 3, subject: "Valentine's Day Deals", status: "draft", recipients: 0, openRate: 0, clickRate: 0 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalSubscribers: subscribers.length,
    activeSubscribers: subscribers.filter(s => s.isActive).length,
    totalCampaigns: campaigns.length,
    avgOpenRate: campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.status === 'sent').length || 0
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Newsletter Management</h1>
            <p className="text-[rgb(var(--color-muted))]">Manage subscribers and email campaigns</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <FiPlus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Total Subscribers</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{stats.totalSubscribers}</p>
              </div>
              <FiUsers className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Active Subscribers</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{stats.activeSubscribers}</p>
              </div>
              <FiMail className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Campaigns Sent</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{stats.totalCampaigns}</p>
              </div>
              <FiSend className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Avg Open Rate</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{stats.avgOpenRate.toFixed(1)}%</p>
              </div>
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))]">
          <div className="border-b border-[rgb(var(--color-border))]">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("subscribers")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "subscribers"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] hover:border-gray-300"
                }`}
              >
                Subscribers ({subscribers.length})
              </button>
              <button
                onClick={() => setActiveTab("campaigns")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "campaigns"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] hover:border-gray-300"
                }`}
              >
                Campaigns ({campaigns.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "subscribers" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgb(var(--color-border))]">
                      <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Subscribed</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--color-border))]">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                          <td className="px-4 py-3 text-sm text-[rgb(var(--color-fg))]">{subscriber.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subscriber.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {subscriber.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[rgb(var(--color-muted))]">
                            {new Date(subscriber.subscribedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="p-1 text-[rgb(var(--color-muted))] hover:text-red-600 transition-colors">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgb(var(--color-border))]">
                      <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Performance</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Sent Date</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--color-border))]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--color-fg))]">{campaign.subject}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              campaign.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {campaign.status === 'sent' ? (
                              <div className="text-xs">
                                <div>Open: {campaign.openRate}%</div>
                                <div>Click: {campaign.clickRate}%</div>
                              </div>
                            ) : (
                              <span className="text-xs text-[rgb(var(--color-muted))]">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[rgb(var(--color-muted))]">
                            {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="p-1 text-[rgb(var(--color-muted))] hover:text-blue-600 transition-colors">
                                <FiEdit className="w-4 h-4" />
                              </button>
                              {campaign.status === 'draft' && (
                                <button className="p-1 text-[rgb(var(--color-muted))] hover:text-green-600 transition-colors">
                                  <FiSend className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-1 text-[rgb(var(--color-muted))] hover:text-red-600 transition-colors">
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}