"use client";

import { useState, useEffect } from "react";
import { FiUser, FiBell, FiShield, FiCreditCard, FiGlobe, FiSave, FiImage } from "react-icons/fi";
import Button from "../../../components/Button";
import SellerImageUpload from "../../../components/SellerImageUpload";
import { api } from "../../../lib/api";

interface SellerSettings {
  notifications: {
    email_new_orders: boolean;
    email_reviews: boolean;
    email_promotions: boolean;
    sms_orders: boolean;
    push_notifications: boolean;
  };
  privacy: {
    show_phone: boolean;
    show_email: boolean;
    allow_reviews: boolean;
    auto_approve_reviews: boolean;
  };
  business: {
    business_hours: string;
    response_time: string;
    auto_reply_message: string;
    vacation_mode: boolean;
    vacation_message: string;
  };
  payment: {
    preferred_withdrawal_method: string;
    minimum_withdrawal: number;
    auto_withdrawal: boolean;
    withdrawal_day: number;
  };
}

export default function SellerSettingsPage() {
  const [settings, setSettings] = useState<SellerSettings>({
    notifications: {
      email_new_orders: true,
      email_reviews: true,
      email_promotions: false,
      sms_orders: false,
      push_notifications: true,
    },
    privacy: {
      show_phone: true,
      show_email: false,
      allow_reviews: true,
      auto_approve_reviews: false,
    },
    business: {
      business_hours: "9:00 AM - 6:00 PM",
      response_time: "within_24_hours",
      auto_reply_message: "Thank you for your inquiry! We'll get back to you soon.",
      vacation_mode: false,
      vacation_message: "",
    },
    payment: {
      preferred_withdrawal_method: "bank_transfer",
      minimum_withdrawal: 1000,
      auto_withdrawal: false,
      withdrawal_day: 1,
    },
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImages, setProfileImages] = useState({
    business_logo: "",
    cover_image: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock data - would be: const response = await api.get('/api/sellers/settings/');
      // setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Mock API call - would be: await api.put('/api/sellers/settings/', settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: keyof SellerSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: "profile", label: "Profile Images", icon: FiImage },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "privacy", label: "Privacy", icon: FiShield },
    { id: "business", label: "Business", icon: FiGlobe },
    { id: "payment", label: "Payment", icon: FiCreditCard },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">Settings</h1>
            <p className="text-[rgb(var(--color-muted))] mt-2">Manage your seller account preferences</p>
          </div>
          <Button variant="primary" onClick={saveSettings} disabled={loading}>
            <FiSave className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                          : "text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-ui))]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] p-6">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Profile Images</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SellerImageUpload
                      type="logo"
                      currentImage={profileImages.business_logo}
                      onImageChange={(url) => setProfileImages(prev => ({ ...prev, business_logo: url }))}
                    />
                    <SellerImageUpload
                      type="cover"
                      currentImage={profileImages.cover_image}
                      onImageChange={(url) => setProfileImages(prev => ({ ...prev, cover_image: url }))}
                    />
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Tip:</strong> Your business logo will appear in seller listings and your store page. 
                      The cover image will be displayed as the background on your store profile.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-[rgb(var(--color-text))] mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: "email_new_orders", label: "New orders and purchases" },
                          { key: "email_reviews", label: "New customer reviews" },
                          { key: "email_promotions", label: "Promotional offers and updates" },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.notifications[key as keyof typeof settings.notifications]}
                              onChange={(e) => updateSetting("notifications", key, e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-[rgb(var(--color-text))]">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-[rgb(var(--color-text))] mb-4">Other Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: "sms_orders", label: "SMS notifications for urgent orders" },
                          { key: "push_notifications", label: "Browser push notifications" },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.notifications[key as keyof typeof settings.notifications]}
                              onChange={(e) => updateSetting("notifications", key, e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-[rgb(var(--color-text))]">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div>
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Privacy Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-[rgb(var(--color-text))] mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        {[
                          { key: "show_phone", label: "Show phone number on profile" },
                          { key: "show_email", label: "Show email address on profile" },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.privacy[key as keyof typeof settings.privacy]}
                              onChange={(e) => updateSetting("privacy", key, e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-[rgb(var(--color-text))]">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-[rgb(var(--color-text))] mb-4">Reviews & Feedback</h3>
                      <div className="space-y-3">
                        {[
                          { key: "allow_reviews", label: "Allow customers to leave reviews" },
                          { key: "auto_approve_reviews", label: "Auto-approve positive reviews (4+ stars)" },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.privacy[key as keyof typeof settings.privacy]}
                              onChange={(e) => updateSetting("privacy", key, e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-[rgb(var(--color-text))]">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div>
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Business Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        Business Hours
                      </label>
                      <input
                        type="text"
                        value={settings.business.business_hours}
                        onChange={(e) => updateSetting("business", "business_hours", e.target.value)}
                        className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., 9:00 AM - 6:00 PM"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        Response Time
                      </label>
                      <select
                        value={settings.business.response_time}
                        onChange={(e) => updateSetting("business", "response_time", e.target.value)}
                        className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="within_1_hour">Within 1 hour</option>
                        <option value="within_24_hours">Within 24 hours</option>
                        <option value="within_48_hours">Within 48 hours</option>
                        <option value="within_week">Within a week</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        Auto-Reply Message
                      </label>
                      <textarea
                        value={settings.business.auto_reply_message}
                        onChange={(e) => updateSetting("business", "auto_reply_message", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                        placeholder="Automatic message sent to customers"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={settings.business.vacation_mode}
                          onChange={(e) => updateSetting("business", "vacation_mode", e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="font-medium text-[rgb(var(--color-text))]">Vacation Mode</span>
                      </label>
                      {settings.business.vacation_mode && (
                        <textarea
                          value={settings.business.vacation_message}
                          onChange={(e) => updateSetting("business", "vacation_message", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                          placeholder="Message to display when on vacation"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payment" && (
                <div>
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Payment Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        Preferred Withdrawal Method
                      </label>
                      <select
                        value={settings.payment.preferred_withdrawal_method}
                        onChange={(e) => updateSetting("payment", "preferred_withdrawal_method", e.target.value)}
                        className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        Minimum Withdrawal Amount (KES)
                      </label>
                      <input
                        type="number"
                        value={settings.payment.minimum_withdrawal}
                        onChange={(e) => updateSetting("payment", "minimum_withdrawal", parseInt(e.target.value))}
                        min="100"
                        step="100"
                        className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={settings.payment.auto_withdrawal}
                          onChange={(e) => updateSetting("payment", "auto_withdrawal", e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="font-medium text-[rgb(var(--color-text))]">Enable Auto-Withdrawal</span>
                      </label>
                      {settings.payment.auto_withdrawal && (
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                            Withdrawal Day (Monthly)
                          </label>
                          <select
                            value={settings.payment.withdrawal_day}
                            onChange={(e) => updateSetting("payment", "withdrawal_day", parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                          >
                            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}