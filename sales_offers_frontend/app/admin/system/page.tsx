"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiServer, FiDatabase, FiCpu, FiHardDrive, FiWifi, FiRefreshCw } from "react-icons/fi";

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  activeUsers: number;
}

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: "0d 0h 0m",
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = () => {
      // Mock data - replace with actual system metrics API
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
        memory: Math.floor(Math.random() * 20) + 60, // 60-80%
        disk: Math.floor(Math.random() * 15) + 45, // 45-60%
        network: Math.floor(Math.random() * 40) + 10, // 10-50%
        uptime: "15d 8h 32m",
        activeUsers: Math.floor(Math.random() * 50) + 150 // 150-200
      });
      setLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-500";
    if (value >= thresholds.warning) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "bg-red-500";
    if (value >= thresholds.warning) return "bg-yellow-500";
    return "bg-green-500";
  };

  const services = [
    { name: "Web Server", status: "running", uptime: "15d 8h", port: "3000" },
    { name: "Database", status: "running", uptime: "15d 8h", port: "5432" },
    { name: "Redis Cache", status: "running", uptime: "15d 8h", port: "6379" },
    { name: "Email Service", status: "running", uptime: "15d 8h", port: "587" },
    { name: "File Storage", status: "warning", uptime: "2d 4h", port: "9000" },
    { name: "Background Jobs", status: "running", uptime: "15d 8h", port: "-" }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">System Monitor</h1>
            <p className="text-[rgb(var(--color-muted))]">Monitor system health and performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Admin Only</span>
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-ui))] transition-colors">
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FiCpu className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-[rgb(var(--color-fg))]">CPU Usage</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`}>
                {loading ? "..." : `${metrics.cpu}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.cpu, { warning: 70, critical: 90 })}`}
                style={{ width: `${metrics.cpu}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FiServer className="w-5 h-5 text-green-500" />
                <span className="font-medium text-[rgb(var(--color-fg))]">Memory</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`}>
                {loading ? "..." : `${metrics.memory}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.memory, { warning: 80, critical: 95 })}`}
                style={{ width: `${metrics.memory}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FiHardDrive className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-[rgb(var(--color-fg))]">Disk Usage</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.disk, { warning: 80, critical: 95 })}`}>
                {loading ? "..." : `${metrics.disk}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.disk, { warning: 80, critical: 95 })}`}
                style={{ width: `${metrics.disk}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FiWifi className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-[rgb(var(--color-fg))]">Network</span>
              </div>
              <span className="text-sm font-medium text-[rgb(var(--color-fg))]">
                {loading ? "..." : `${metrics.network} MB/s`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(metrics.network * 2, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Info */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">System Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-muted))]">Uptime</span>
                <span className="text-[rgb(var(--color-fg))] font-medium">{metrics.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-muted))]">Active Users</span>
                <span className="text-[rgb(var(--color-fg))] font-medium">{metrics.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-muted))]">Server Time</span>
                <span className="text-[rgb(var(--color-fg))] font-medium">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-muted))]">Environment</span>
                <span className="text-[rgb(var(--color-fg))] font-medium">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-muted))]">Version</span>
                <span className="text-[rgb(var(--color-fg))] font-medium">v1.2.3</span>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Services Status</h3>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--color-ui))]">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'running' ? 'bg-green-500' :
                      service.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{service.name}</p>
                      <p className="text-xs text-[rgb(var(--color-muted))]">Port: {service.port}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${
                      service.status === 'running' ? 'text-green-600 dark:text-green-400' :
                      service.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{service.uptime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Database Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-[rgb(var(--color-ui))]">
              <FiDatabase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-[rgb(var(--color-fg))]">Connections</p>
              <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">24/100</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[rgb(var(--color-ui))]">
              <FiServer className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-[rgb(var(--color-fg))]">Query Time</p>
              <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">45ms</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[rgb(var(--color-ui))]">
              <FiHardDrive className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-[rgb(var(--color-fg))]">Storage</p>
              <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">2.4GB</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}