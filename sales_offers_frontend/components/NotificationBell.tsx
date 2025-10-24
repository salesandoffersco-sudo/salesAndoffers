"use client";

import { useState, useEffect, useRef } from "react";
import { FiBell, FiX, FiCheck, FiHeart, FiTag, FiTrendingUp, FiUser } from "react-icons/fi";
import { api } from "../lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'offer' | 'favorite' | 'system' | 'promotion' | 'welcome';
  is_read: boolean;
  created_at: string;
  related_offer_id?: number;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    
    // Listen for auth changes to refresh notifications
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetchNotifications();
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    
    window.addEventListener("authChange", handleAuthChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      // Fetch regular notifications
      const [regularRes, adminRes] = await Promise.all([
        api.get('/api/accounts/notifications/?limit=10'),
        api.get('/api/verification/notifications/')
      ]);
      
      const regularNotifications = regularRes.data;
      const adminData = adminRes.data;
      
      // Combine regular notifications with admin notifications
      const allNotifications = [
        ...adminData.notifications.map((n: any) => ({
          ...n,
          type: 'admin_notification',
          is_read: false
        })),
        ...regularNotifications
      ];
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter((n: Notification) => !n.is_read).length);
      
      // Show popups if any
      if (adminData.popups && adminData.popups.length > 0) {
        adminData.popups.forEach((popup: any) => {
          showPopup(popup);
        });
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  };

  const showPopup = (popup: any) => {
    // Create and show popup modal
    const popupDiv = document.createElement('div');
    popupDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    popupDiv.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${popup.title}</h3>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onclick="this.closest('.fixed').remove()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p class="text-gray-600 dark:text-gray-300 mb-4">${popup.message}</p>
        <button 
          class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          onclick="this.closest('.fixed').remove()"
        >
          Got it
        </button>
      </div>
    `;
    
    document.body.appendChild(popupDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(popupDiv)) {
        document.body.removeChild(popupDiv);
      }
    }, 10000);
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/api/accounts/notifications/${notificationId}/`, { is_read: true });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer': return <FiTag className="text-blue-500" />;
      case 'favorite': return <FiHeart className="text-red-500" />;
      case 'promotion': return <FiTrendingUp className="text-green-500" />;
      case 'welcome': return <FiUser className="text-purple-500" />;
      case 'admin_notification': return <FiBell className="text-orange-500" />;
      default: return <FiBell className="text-gray-500" />;
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[rgb(var(--color-card))] rounded-lg shadow-xl border border-[rgb(var(--color-border))] z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--color-text))]">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[rgb(var(--color-muted))]">
                <FiBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg))] transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notification.is_read ? 'text-[rgb(var(--color-text))]' : 'text-[rgb(var(--color-muted))]'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-muted))] mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-muted))] mt-2">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-sm text-[rgb(var(--color-primary))] hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}