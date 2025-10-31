"use client";

import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';
import Button from '../../components/Button';
import ProfilePictureUpload from '../../components/ProfilePictureUpload';
import { api } from '../../lib/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  google_picture?: string;
  phone?: string;
  address?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/accounts/profile/');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || '',
        address: response.data.address || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureUpload = async (url: string) => {
    try {
      await api.patch('/api/accounts/profile/', { profile_picture: url });
      setProfile(prev => prev ? { ...prev, profile_picture: url } : null);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture');
    }
  };

  const handleProfilePictureDelete = async () => {
    try {
      await api.patch('/api/accounts/profile/', { profile_picture: null });
      setProfile(prev => prev ? { ...prev, profile_picture: undefined } : null);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      alert('Failed to delete profile picture');
    }
  };

  const handleUseGooglePicture = async () => {
    if (!profile?.google_picture) return;
    
    try {
      await api.patch('/api/accounts/profile/', { profile_picture: profile.google_picture });
      setProfile(prev => prev ? { ...prev, profile_picture: profile.google_picture } : null);
    } catch (error) {
      console.error('Error using Google picture:', error);
      alert('Failed to use Google picture');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.patch('/api/accounts/profile/', formData);
      setProfile(response.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Profile Not Found</h1>
          <p className="text-[rgb(var(--color-muted))]">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-8">My Profile</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Picture Section */}
              <div className="lg:w-1/3">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">Profile Picture</h2>
                  <ProfilePictureUpload
                    currentPicture={profile.profile_picture}
                    googlePicture={profile.google_picture}
                    onUpload={handleProfilePictureUpload}
                    onDelete={handleProfilePictureDelete}
                    onUseGoogle={handleUseGooglePicture}
                    disabled={saving}
                    size="lg"
                  />
                </div>
              </div>

              {/* Profile Form Section */}
              <div className="lg:w-2/3">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your first name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-ui))] text-[rgb(var(--color-muted))] cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-[rgb(var(--color-muted))] mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-[rgb(var(--color-muted))]" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                      className="px-8"
                    >
                      <FiSave className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}