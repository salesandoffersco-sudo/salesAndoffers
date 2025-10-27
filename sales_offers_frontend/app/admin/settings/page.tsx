"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiSave, FiMail, FiServer, FiShield, FiDatabase, FiGlobe } from "react-icons/fi";
import { api } from "../../../lib/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "Sales & Offers",
    siteDescription: "Your trusted marketplace for amazing deals and offers",
    adminEmail: "admin@salesandoffers.com",
    supportEmail: "support@salesandoffers.com",
    maintenanceMode: false,
    userRegistration: true,
    emailVerification: true,
    newsletterEnabled: true,
    maxFileSize: "10",
    sessionTimeout: "30",
    backupFrequency: "daily",
    logLevel: "info"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings/');
      const data = response.data;
      
      setSettings({
        siteName: data.siteName || "Sales & Offers",
        siteDescription: data.siteDescription || "Your trusted marketplace for amazing deals and offers",
        adminEmail: data.adminEmail || "admin@salesandoffers.com",
        supportEmail: data.supportEmail || "support@salesandoffers.com",
        maintenanceMode: data.maintenanceMode === 'true',
        userRegistration: data.userRegistration === 'true',
        emailVerification: data.emailVerification === 'true',
        newsletterEnabled: data.newsletterEnabled === 'true',
        maxFileSize: data.maxFileSize || "10",
        sessionTimeout: data.sessionTimeout || "30",
        backupFrequency: data.backupFrequency || "daily",
        logLevel: data.logLevel || "info"
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/api/admin/settings/', settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error('Error saving settings:', error);
      alert("Error saving settings. Please try again.");
    }
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">System Settings</h1>
            <p className="text-[rgb(var(--color-muted))]">Configure system-wide settings and preferences</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2 mb-4">
              <FiGlobe className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))]">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--color-fg))]">Maintenance Mode</label>
                  <p className="text-xs text-[rgb(var(--color-muted))]">Temporarily disable site access</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2 mb-4">
              <FiMail className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))]">Email Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Admin Email</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--color-fg))]">Email Verification</label>
                  <p className="text-xs text-[rgb(var(--color-muted))]">Require email verification for new users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailVerification}
                    onChange={(e) => handleInputChange('emailVerification', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2 mb-4">
              <FiShield className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))]">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--color-fg))]">User Registration</label>
                  <p className="text-xs text-[rgb(var(--color-muted))]">Allow new user registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.userRegistration}
                    onChange={(e) => handleInputChange('userRegistration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2 mb-4">
              <FiServer className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))]">System Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Backup Frequency</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Log Level</label>
                <select
                  value={settings.logLevel}
                  onChange={(e) => handleInputChange('logLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--color-fg))]">Newsletter System</label>
                  <p className="text-xs text-[rgb(var(--color-muted))]">Enable newsletter subscriptions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.newsletterEnabled}
                    onChange={(e) => handleInputChange('newsletterEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}