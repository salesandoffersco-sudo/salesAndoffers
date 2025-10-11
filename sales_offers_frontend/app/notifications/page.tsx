"use client";

import { useState, useEffect } from "react";
import { FiBell, FiCheck, FiX, FiTag, FiHeart, FiTrendingUp, FiUser, FiTrash2, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'offer' | 'favorite' | 'system' | 'promotion' | 'welcome';
  is_read: boolean;
  created_at: string;
  related_offer_id?: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/accounts/notifications/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/api/accounts/notifications/${notificationId}/`, 
        { is_read: true },
        { headers: { Authorization: `Token ${token}` } }
      );
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/accounts/notifications/mark-all-read/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/accounts/notifications/${notificationId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <FiTag className="text-blue-500" />;
      case 'favorite':
        return <FiHeart className="text-red-500" />;
      case 'promotion':
        return <FiTrendingUp className="text-green-500" />;
      case 'welcome':
        return <FiUser className="text-purple-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return '';
    switch (type) {
      case 'offer': return 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500';
      case 'favorite': return 'bg-red-50/50 dark:bg-red-900/10 border-l-4 border-l-red-500';
      case 'promotion': return 'bg-green-50/50 dark:bg-green-900/10 border-l-4 border-l-green-500';
      case 'welcome': return 'bg-purple-50/50 dark:bg-purple-900/10 border-l-4 border-l-purple-500';
      default: return 'bg-gray-50/50 dark:bg-gray-900/10 border-l-4 border-l-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(notif => !notif.is_read)
    : notifications;

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-bounce" style={{animationDuration: '3s'}}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <FiBell className="text-4xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Notifications</h1>
              <p className="text-xl opacity-90">
                {unreadCount > 0 ? (
                  <span className="flex items-center space-x-2">
                    <span>{unreadCount} unread notifications</span>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>All caught up!</span>
                    <FiCheckCircle className="text-green-400" />
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <FiCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <FiBell className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
              {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            </h2>
            <p className="text-[rgb(var(--color-muted))]">
              {filter === 'unread' 
                ? 'All your notifications have been read!' 
                : 'We\'ll notify you when something important happens.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] p-5 transition-all duration-300 hover:shadow-md ${
                  getNotificationBgColor(notification.type, notification.is_read)
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-sm font-semibold ${!notification.is_read ? 'text-[rgb(var(--color-text))]' : 'text-[rgb(var(--color-muted))]'}`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <p className="text-sm text-[rgb(var(--color-muted))] leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[rgb(var(--color-muted))] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                          <div className="flex items-center space-x-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full"
                                title="Mark as read"
                              >
                                <FiCheckCircle className="w-3 h-3" />
                                <span>Mark read</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full"
                              title="Delete notification"
                            >
                              <FiTrash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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