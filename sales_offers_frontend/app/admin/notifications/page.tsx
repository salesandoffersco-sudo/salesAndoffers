"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiBell, FiSend, FiUsers, FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

interface AdminNotification {
  id: number;
  title: string;
  message: string;
  notification_type: 'notification' | 'popup';
  target_audience: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  sent_count: number;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    notification_type: "notification" as "notification" | "popup",
    target_audience: "all",
    expires_at: "",
    specific_users: [] as string[]
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const mockData = [
        {
          id: 1,
          title: "System Maintenance",
          message: "Scheduled maintenance on Sunday 2-4 AM",
          notification_type: "popup" as const,
          target_audience: "all",
          is_active: true,
          expires_at: "2024-01-20T00:00:00Z",
          created_at: "2024-01-15T10:30:00Z",
          sent_count: 1247
        }
      ];
      
      setNotifications(mockData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newNotification = {
      id: notifications.length + 1,
      ...formData,
      is_active: true,
      created_at: new Date().toISOString(),
      sent_count: 0
    };
    
    setNotifications([newNotification, ...notifications]);
    setFormData({
      title: "",
      message: "",
      notification_type: "notification",
      target_audience: "all",
      expires_at: "",
      specific_users: []
    });
    setShowCreateForm(false);
  };

  const handleToggleActive = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, is_active: !notif.is_active } : notif
    ));
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      setNotifications(notifications.filter(notif => notif.id !== id));
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'popup' 
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const getAudienceLabel = (audience: string) => {
    const labels: Record<string, string> = {
      'all': 'All Users',
      'sellers': 'All Sellers',
      'buyers': 'All Buyers',
      'verified_sellers': 'Verified Sellers',
      'unverified_sellers': 'Unverified Sellers',
      'premium_users': 'Premium Subscribers',
      'specific_users': 'Specific Users'
    };
    return labels[audience] || audience;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Notifications</h1>
            <p className="text-[rgb(var(--color-muted))]">Send notifications and announcements to users</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Create Notification
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] p-6">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-6">Create New Notification</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.notification_type}
                    onChange={(e) => setFormData({ ...formData, notification_type: e.target.value as "notification" | "popup" })}
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="notification">Notification</option>
                    <option value="popup">Popup Modal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Target Audience *
                  </label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Users</option>
                    <option value="sellers">All Sellers</option>
                    <option value="buyers">All Buyers</option>
                    <option value="verified_sellers">Verified Sellers</option>
                    <option value="unverified_sellers">Unverified Sellers</option>
                    <option value="premium_users">Premium Subscribers</option>
                    <option value="specific_users">Specific Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  placeholder="Notification message content..."
                />
              </div>

              {formData.target_audience === 'specific_users' && (
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    User Emails (comma separated)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                    placeholder="user1@example.com, user2@example.com"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FiSend className="w-4 h-4" />
                  Send Notification
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))]">Sent Notifications</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Notification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Audience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Sent To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FiBell className="mx-auto h-12 w-12 text-[rgb(var(--color-muted))] mb-4" />
                      <p className="text-[rgb(var(--color-muted))]">No notifications sent yet</p>
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--color-fg))]">{notification.title}</div>
                          <div className="text-sm text-[rgb(var(--color-muted))] truncate max-w-xs">
                            {notification.message}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.notification_type)}`}>
                          {notification.notification_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[rgb(var(--color-fg))]">
                          {getAudienceLabel(notification.target_audience)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4 text-[rgb(var(--color-muted))]" />
                          <span className="text-sm text-[rgb(var(--color-fg))]">
                            {notification.sent_count.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {notification.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[rgb(var(--color-fg))]">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(notification.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
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
        </div>
      </div>
    </AdminLayout>
  );
}