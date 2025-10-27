"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiShield, FiAlertTriangle, FiLock, FiEye, FiUserX, FiActivity, FiRefreshCw, FiDownload } from "react-icons/fi";
import { api } from "../../../lib/api";
import { api } from "../../../lib/api";

interface SecurityEvent {
  id: number;
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'account_locked' | 'password_reset';
  user: string;
  ip_address: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export default function AdminSecurity() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const response = await api.get('/api/admin/security/');
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching security events:", error);
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSeverity = filterSeverity === "all" || event.severity === filterSeverity;
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return FiUserX;
      case 'suspicious_activity': return FiAlertTriangle;
      case 'account_locked': return FiLock;
      case 'login_attempt': return FiActivity;
      case 'password_reset': return FiRefreshCw;
      default: return FiShield;
    }
  };

  const stats = {
    totalEvents: events.length,
    criticalEvents: events.filter(e => e.severity === 'critical').length,
    highEvents: events.filter(e => e.severity === 'high').length,
    blockedIPs: new Set(events.filter(e => e.severity === 'critical').map(e => e.ip_address)).size
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Security Center</h1>
            <p className="text-[rgb(var(--color-muted))]">Monitor security events and threats</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchSecurityEvents}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <FiDownload className="w-4 h-4" />
              Export Log
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Total Events</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.totalEvents}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FiActivity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Critical Events</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.criticalEvents}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">High Priority</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.highEvents}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FiShield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Blocked IPs</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.blockedIPs}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                <FiLock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="login_attempt">Login Attempts</option>
                <option value="failed_login">Failed Logins</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="account_locked">Account Locked</option>
                <option value="password_reset">Password Reset</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))]">Security Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[rgb(var(--color-muted))]">
                      No security events found
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => {
                    const TypeIcon = getTypeIcon(event.type);
                    return (
                      <tr key={event.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="w-5 h-5 text-[rgb(var(--color-muted))]" />
                            <div>
                              <div className="text-sm font-medium text-[rgb(var(--color-fg))]">
                                {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </div>
                              <div className="text-xs text-[rgb(var(--color-muted))]">{event.details}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[rgb(var(--color-fg))]">{event.user}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-[rgb(var(--color-fg))]">{event.ip_address}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[rgb(var(--color-fg))]">{event.location}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[rgb(var(--color-fg))]">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-[rgb(var(--color-muted))]">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                              <FiLock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}