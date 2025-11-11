"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiShoppingBag, FiBell, FiTrendingUp, FiEye, FiClock } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface UserStats {
  favorites_count: number;
  viewed_offers: number;
  saved_searches: number;
  notifications_count: number;
}

interface RecentOffer {
  id: number;
  title: string;
  discounted_price: string;
  discount_percentage: number;
  category: string;
  seller: {
    business_name: string;
  };
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats>({ favorites_count: 0, viewed_offers: 0, saved_searches: 0, notifications_count: 0 });
  const [recentOffers, setRecentOffers] = useState<RecentOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Token ${token}` };

      const [statsRes, offersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/accounts/dashboard-stats/`, { headers }),
        axios.get(`${API_BASE_URL}/api/offers/?limit=6`)
      ]);

      setStats(statsRes.data);
      setRecentOffers(offersRes.data.results || offersRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {username}! 👋</h1>
          <p className="text-xl opacity-90">Compare prices, find deals, and save money across stores</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/favorites">
            <div className="bg-[rgb(var(--color-card))] p-6 rounded-xl shadow-sm border border-[rgb(var(--color-border))] hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[rgb(var(--color-muted))] text-sm font-medium">Favorites</p>
                  <p className="text-3xl font-bold text-[rgb(var(--color-text))] mt-2">{stats.favorites_count}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <FiHeart className="text-red-600 dark:text-red-400 text-xl" />
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-[rgb(var(--color-card))] p-6 rounded-xl shadow-sm border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[rgb(var(--color-muted))] text-sm font-medium">Deals Viewed</p>
                <p className="text-3xl font-bold text-[rgb(var(--color-text))] mt-2">{stats.viewed_offers}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <FiEye className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] p-6 rounded-xl shadow-sm border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[rgb(var(--color-muted))] text-sm font-medium">Price Comparisons</p>
                <p className="text-3xl font-bold text-[rgb(var(--color-text))] mt-2">{stats.saved_searches}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <FiTrendingUp className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </div>

          <Link href="/notifications">
            <div className="bg-[rgb(var(--color-card))] p-6 rounded-xl shadow-sm border border-[rgb(var(--color-border))] hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[rgb(var(--color-muted))] text-sm font-medium">Notifications</p>
                  <p className="text-3xl font-bold text-[rgb(var(--color-text))] mt-2">{stats.notifications_count}</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                  <FiBell className="text-orange-600 dark:text-orange-400 text-xl" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 border border-[rgb(var(--color-border))] mb-8">
          <h2 className="text-xl font-bold text-[rgb(var(--color-text))] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/offers">
              <Button variant="outline" className="w-full justify-start">
                <FiShoppingBag className="w-5 h-5 mr-3" />
Browse Deals
              </Button>
            </Link>
            <Link href="/favorites">
              <Button variant="outline" className="w-full justify-start">
                <FiHeart className="w-5 h-5 mr-3" />
                View Favorites
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="w-full justify-start">
                <FiEye className="w-5 h-5 mr-3" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Offers */}
        <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 border border-[rgb(var(--color-border))]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">Trending Deals</h2>
            <Link href="/offers">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentOffers.map((offer) => (
                <Link key={offer.id} href={`/offers/${offer.id}`}>
                  <div className="border border-[rgb(var(--color-border))] rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-2 py-1 rounded-full text-xs font-semibold">
                        {offer.category}
                      </span>
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">
                        {offer.discount_percentage}% OFF
                      </span>
                    </div>
                    <h3 className="font-semibold text-[rgb(var(--color-text))] mb-2 line-clamp-2">{offer.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600 dark:text-indigo-300">
                        KES {offer.discounted_price}
                      </span>
                      <span className="text-sm text-[rgb(var(--color-muted))]">
                        by {offer.seller.business_name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}