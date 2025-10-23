"use client";

import { useState, useEffect } from "react";
import { FiBell, FiCheck, FiX, FiTrash2, FiFilter, FiRefreshCw } from "react-icons/fi";
import Button from "../../../components/Button";
import { api } from "../../../lib/api";

interface Notification {
  id: number;
  type: "order" | "review" | "system" | "promotion";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock data since backend endpoint doesn't exist yet
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: "order",
          title: "New Order Received",
          message: "You have received a new order for 'Premium Wireless Headphones'. Customer: John Doe",
          is_read: false,
          created_at: "2024-01-15T10:30:00Z",
          action_url: "/seller/orders/123"
        },
        {
          id: 2,
          type: "review",
          title: "New Customer Review",
          message: "Jane Smith left a 5-star review for your 'Smart Fitness Watch' deal.",
          is_read: false,
          created_at: "2024-01-14T15:45:00Z",
          action_url: "/seller/reviews"
        },
        {
          id: 3,
          type: "system",
          title: "Subscription Renewal",
          message: "Your Pro subscription will expire in 7 days. Renew now to continue enjoying premium features.",
          is_read: true,
          created_at: "2024-01-13T09:15:00Z",
          action_url: "/pricing"
        },
        {
          id: 4,
          type: "promotion",
          title: "Featured Listing Opportunity",
          message: "Boost your deals visibility with our featured listing promotion. 50% off this week!",
          is_read: true,
          created_at: "2024-01-12T14:20:00Z",
          action_url: "/seller/promotions"
        },
        {
          id: 5,
          type: "order",
          title: "Order Completed",
          message: "Customer Mike Johnson has successfully redeemed their voucher for 'Professional Camera'.",
          is_read: true,
          created_at: "2024-01-11T11:30:00Z"
        }
      ];
      setNotifications(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      // Mock API call - would be: await api.patch(`/api/notifications/${id}/`, { is_read: true });
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mock API call - would be: await api.post('/api/notifications/mark-all-read/');
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      // Mock API call - would be: await api.delete(`/api/notifications/${id}/`);
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order": return "🛒";
      case "review": return "⭐";
      case "system": return "⚙️";
      case "promotion": return "🎯";
      default: return "📢";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "system": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "promotion": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.is_read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">Notifications</h1>
            <p className="text-[rgb(var(--color-muted))] mt-2">
              Stay updated with your business activities
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              <FiRefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="primary" size="sm" onClick={markAllAsRead}>
                <FiCheck className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 mb-6 border border-[rgb(var(--color-border))]">
          <div className="flex items-center gap-4 flex-wrap">
            <FiFilter className="text-[rgb(var(--color-muted))]" />
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
                { value: "order", label: "Orders" },
                { value: "review", label: "Reviews" },
                { value: "system", label: "System" },
                { value: "promotion", label: "Promotions" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === value
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                  {value === "unread" && unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <FiBell className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">No notifications</h3>
            <p className="text-[rgb(var(--color-muted))]">
              {filter === "unread" 
                ? "All caught up! No unread notifications." 
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-[rgb(var(--color-card))] rounded-xl p-6 border transition-all duration-200 ${
                  notification.is_read 
                    ? "border-[rgb(var(--color-border))]" 
                    : "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold ${
                          notification.is_read 
                            ? "text-[rgb(var(--color-text))]" 
                            : "text-purple-600 dark:text-purple-400"
                        }`}>
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-[rgb(var(--color-muted))] mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[rgb(var(--color-muted))]">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        {notification.action_url && (
                          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <FiCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}