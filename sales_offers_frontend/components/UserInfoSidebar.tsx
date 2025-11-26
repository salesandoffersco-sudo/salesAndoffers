"use client";

import { FiX, FiStar, FiMapPin, FiClock, FiShield, FiUser, FiBriefcase, FiPhone, FiMail, FiGlobe, FiMessageCircle, FiFlag } from "react-icons/fi";
import VerificationBadge from "./VerificationBadge";
import Button from "./Button";

interface User {
  id: number;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller';
  business_name?: string;
  is_online: boolean;
  last_seen?: string;
  is_verified?: boolean;
  rating?: number;
  total_reviews?: number;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  member_since?: string;
}

interface UserInfoSidebarProps {
  user: User;
  onClose: () => void;
  showCloseButton: boolean;
  isMobile?: boolean;
}



export default function UserInfoSidebar({
  user,
  onClose,
  showCloseButton,
  isMobile = false
}: UserInfoSidebarProps) {
  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-[rgb(var(--color-card))] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[rgb(var(--color-border))]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[rgb(var(--color-text))]">
            {user.role === 'seller' ? 'Seller Info' : 'User Info'}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-[rgb(var(--color-muted))]" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {user.is_online && (
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 mb-2">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text))]">
              {user.name}
            </h3>
            {user.is_verified && (
              <VerificationBadge
                isVerified={true}
                type={user.role === 'seller' ? 'seller' : 'user'}
                size="md"
              />
            )}
          </div>

          {user.role === 'seller' && user.business_name && (
            <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
              {user.business_name}
            </p>
          )}

          <p className="text-sm text-[rgb(var(--color-muted))]">
            {user.is_online
              ? 'Online now'
              : `Last seen ${formatLastSeen(user.last_seen || '')}`
            }
          </p>
        </div>

        {/* Business Info Section for Sellers */}
        {user.role === 'seller' && user.business_name && (
          <div className="bg-[rgb(var(--color-bg))] rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {user.business_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[rgb(var(--color-text))] truncate">
                  {user.business_name}
                </h4>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Business
                </p>
              </div>
            </div>
            {user.description && (
              <p className="text-sm text-[rgb(var(--color-muted))] leading-relaxed">
                {user.description}
              </p>
            )}
          </div>
        )}

        {/* Role-specific Information */}
        {user.role === 'seller' ? (
          <>
            {/* Seller Rating */}
            <div className="bg-[rgb(var(--color-bg))] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[rgb(var(--color-text))]">Rating</h4>
                <div className="flex items-center space-x-1">
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-bold text-[rgb(var(--color-text))]">
                    {(user.rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--color-muted))]">
                {user.total_reviews || 0} reviews
              </p>
            </div>

            {/* Business Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[rgb(var(--color-text))] flex items-center">
                <FiBriefcase className="w-4 h-4 mr-2" />
                Business Details
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiMapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{user.location || 'Location not provided'}</span>
                </div>

                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiClock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Mon-Sat: 8:00 AM - 8:00 PM</span>
                </div>

                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiMessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Usually responds within 2 hours</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[rgb(var(--color-text))]">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiPhone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiMail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{user.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiGlobe className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{user.website || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[rgb(var(--color-text))]">Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {user.is_verified && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                    Verified Seller
                  </span>
                )}
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                  Active Seller
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Buyer Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[rgb(var(--color-text))] flex items-center">
                <FiUser className="w-4 h-4 mr-2" />
                User Details
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiMapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{user.location || 'Location not provided'}</span>
                </div>

                <div className="flex items-center text-[rgb(var(--color-muted))]">
                  <FiClock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Member since {formatMemberSince(user.member_since || '2024-01-01')}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Verification Info */}
        {user.is_verified && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiShield className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-300">
                Verified {user.role === 'seller' ? 'Seller' : 'User'}
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Identity verified
            </p>
          </div>
        )}

        {/* Description */}
        {user.role === 'seller' && (
          <div className="space-y-3">
            <h4 className="font-semibold text-[rgb(var(--color-text))]">About</h4>
            <p className="text-sm text-[rgb(var(--color-muted))] leading-relaxed">
              {user.description || 'No description provided.'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-[rgb(var(--color-border))]">
          <Button variant="outline" size="sm" className="w-full">
            <FiUser className="w-4 h-4 mr-2" />
            View Profile
          </Button>

          <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
            <FiFlag className="w-4 h-4 mr-2" />
            Report User
          </Button>
        </div>
      </div>
    </div>
  );
}