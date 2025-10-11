"use client";

import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/accounts/profile/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfile(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/api/accounts/profile/`, formData, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfile({ ...profile!, ...formData });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
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
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))]">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">My Profile</h1>
              {!editing ? (
                <Button onClick={() => setEditing(true)} variant="outline">
                  <FiEdit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} variant="primary">
                    <FiSave className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => { setEditing(false); setFormData(profile!); }} variant="outline">
                    <FiX className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {profile?.profile_picture ? (
                      <img src={profile.profile_picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FiUser className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-[rgb(var(--color-muted))]">@{profile?.username}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        First Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.first_name || ""}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
                        />
                      ) : (
                        <p className="text-[rgb(var(--color-text))]">{profile?.first_name || "Not set"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        Last Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.last_name || ""}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
                        />
                      ) : (
                        <p className="text-[rgb(var(--color-text))]">{profile?.last_name || "Not set"}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                      <FiMail className="inline w-4 h-4 mr-2" />
                      Email
                    </label>
                    <p className="text-[rgb(var(--color-text))]">{profile?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                      <FiPhone className="inline w-4 h-4 mr-2" />
                      Phone
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
                      />
                    ) : (
                      <p className="text-[rgb(var(--color-text))]">{profile?.phone || "Not set"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                      <FiMapPin className="inline w-4 h-4 mr-2" />
                      Address
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
                      />
                    ) : (
                      <p className="text-[rgb(var(--color-text))]">{profile?.address || "Not set"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}