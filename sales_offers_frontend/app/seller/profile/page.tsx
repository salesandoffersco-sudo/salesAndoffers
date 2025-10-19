"use client";

import { useState, useEffect } from "react";
import { FiSave, FiEye, FiEyeOff, FiBuilding } from "react-icons/fi";
import axios from "axios";
import LoadingButton from "../../../components/LoadingButton";
import { API_BASE_URL } from "../../../lib/api";

interface SellerProfile {
  id?: number;
  company_name: string;
  company_logo: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  is_published: boolean;
}

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<SellerProfile>({
    company_name: "",
    company_logo: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    is_published: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/sellers/profile/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/sellers/profile/`, profile, {
        headers: { Authorization: `Token ${token}` }
      });
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/api/sellers/profile/toggle-publish/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfile(prev => ({ ...prev, is_published: response.data.is_published }));
      alert(response.data.is_published ? "Profile published!" : "Profile unpublished!");
    } catch (error) {
      console.error("Error toggling publish:", error);
      alert("Failed to update publish status");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[rgb(var(--color-card))] rounded-xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FiBuilding className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Seller Profile</h1>
                  <p className="text-purple-100">Manage your business information</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.is_published ? 'Published' : 'Draft'}
                </span>
                <LoadingButton
                  loading={publishing}
                  onClick={handleTogglePublish}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {profile.is_published ? <FiEyeOff className="w-4 h-4 mr-2" /> : <FiEye className="w-4 h-4 mr-2" />}
                  {profile.is_published ? 'Unpublish' : 'Publish'}
                </LoadingButton>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                Company Logo URL
              </label>
              <input
                type="url"
                value={profile.company_logo}
                onChange={(e) => setProfile(prev => ({ ...prev, company_logo: e.target.value }))}
                className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                Description *
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your business..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                Address *
              </label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter business address"
              />
            </div>

            {!profile.is_published && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Note:</strong> You must publish your profile before you can create offers. 
                  Your profile will be visible to customers on the sellers page.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-[rgb(var(--color-border))]">
              <LoadingButton
                loading={saving}
                onClick={handleSave}
                variant="primary"
                className="min-w-[120px]"
              >
                <FiSave className="w-4 h-4 mr-2" />
                Save Profile
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}