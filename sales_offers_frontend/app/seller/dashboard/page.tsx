"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShoppingBag, FiPlus, FiDollarSign, FiTrendingUp, FiPackage, FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import CreateOfferModal from "../../../components/CreateOfferModal";
import { API_BASE_URL } from "../../../lib/api";

interface SubscriptionPlan {
  id: number;
  name: string;
  price_ksh: string;
  duration_days: number;
  max_offers: number;
  features: string[];
}

interface SellerStats {
  total_offers: number;
  active_offers: number;
  revenue: number;
  growth: number;
}

interface Offer {
  id: number;
  title: string;
  discounted_price: string;
  original_price: string;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
}

export default function SellerDashboardPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<SellerStats>({ total_offers: 0, active_offers: 0, revenue: 0, growth: 0 });
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Token ${token}` };

      const [plansRes, statsRes, offersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/sellers/subscription-plans/`),
        axios.get(`${API_BASE_URL}/api/sellers/stats/`, { headers }),
        axios.get(`${API_BASE_URL}/api/sellers/offers/`, { headers })
      ]);

      setPlans(plansRes.data);
      setStats(statsRes.data);
      setOffers(offersRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FiShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Hello, {username}! 👋</h1>
                  <p className="text-purple-100 text-lg">Welcome back to your dashboard</p>
                </div>
              </div>
              <p className="text-xl opacity-90 max-w-2xl">Manage your listings, track performance, and grow your business with powerful tools.</p>
            </div>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" onClick={() => setShowCreateModal(true)}>
              <FiPlus className="w-5 h-5 mr-2" />
              List Item
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Offers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.total_offers}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <FiPackage className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Offers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.active_offers}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <FiEye className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">KES {stats.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <FiDollarSign className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Growth</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">+{stats.growth}%</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <FiTrendingUp className="text-orange-600 dark:text-orange-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Offers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Offers</h2>
              <Button variant="outline" size="sm" onClick={() => alert('View all offers page coming soon!')}>View All</Button>
            </div>
          </div>
          <div className="p-6">
            {offers.length === 0 ? (
              <div className="text-center py-8">
                <FiPackage className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No offers yet. Create your first offer!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.slice(0, 5).map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{offer.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-purple-600 dark:text-purple-400 font-medium">KES {offer.discounted_price}</span>
                        <span className="text-gray-500 line-through">KES {offer.original_price}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => alert('Edit offer coming soon!')}>
                        <FiEdit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert('Delete offer coming soon!')}>
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Subscription Plans</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a plan to unlock more features</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">KES {plan.price_ksh}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">/{plan.duration_days} days</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Up to {plan.max_offers} offers
                      </li>
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="primary" size="sm" className="w-full" onClick={() => alert('Subscription coming soon!')}>
                      Subscribe
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateOfferModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchData(); // Refresh data after creating offer
        }}
      />
    </div>
  );
}