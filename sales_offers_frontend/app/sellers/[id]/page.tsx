"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiMapPin, FiStar, FiTag, FiClock, FiHeart } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

interface Seller {
  id: number;
  business_name: string;
  business_description: string;
  business_logo?: string;
  rating: number;
  total_reviews: number;
  address: string;
  created_at: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  discount_percentage: number;
  category: string;
  valid_until: string;
}

export default function SellerProfilePage() {
  const params = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSellerData();
    }
  }, [params.id]);

  const fetchSellerData = async () => {
    try {
      const [sellerRes, offersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/sellers/${params.id}/`),
        axios.get(`${API_BASE_URL}/api/sellers/${params.id}/offers/`)
      ]);
      setSeller(sellerRes.data);
      setOffers(offersRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching seller data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Seller Not Found</h1>
          <p className="text-[rgb(var(--color-muted))] mb-4">The seller you're looking for doesn't exist.</p>
          <Link href="/sellers">
            <Button variant="primary">Browse Sellers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {seller.business_logo ? (
                <img src={seller.business_logo} alt={seller.business_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{seller.business_name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{seller.business_name}</h1>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(seller.rating) ? "text-yellow-400 fill-current" : "text-white/40"}`}
                    />
                  ))}
                  <span className="ml-2 text-lg">{seller.rating.toFixed(1)} ({seller.total_reviews} reviews)</span>
                </div>
              </div>
              <div className="flex items-center text-white/80">
                <FiMapPin className="w-4 h-4 mr-2" />
                {seller.address}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 border border-[rgb(var(--color-border))] mb-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">About</h3>
              <p className="text-[rgb(var(--color-muted))] leading-relaxed mb-4">{seller.business_description}</p>
              <div className="text-sm text-[rgb(var(--color-muted))]">
                Member since {new Date(seller.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-muted))]">Active Offers</span>
                  <span className="font-semibold text-[rgb(var(--color-text))]">{offers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-muted))]">Rating</span>
                  <span className="font-semibold text-[rgb(var(--color-text))]">{seller.rating.toFixed(1)}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-muted))]">Reviews</span>
                  <span className="font-semibold text-[rgb(var(--color-text))]">{seller.total_reviews}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">Current Offers</h2>
              <span className="text-[rgb(var(--color-muted))]">{offers.length} offers available</span>
            </div>

            {offers.length === 0 ? (
              <div className="text-center py-12">
                <FiTag className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">No Active Offers</h3>
                <p className="text-[rgb(var(--color-muted))]">This seller doesn't have any active offers at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))]"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                          {offer.category}
                        </span>
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <FiHeart className="text-xl" />
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-[rgb(var(--color-text))] mb-2">{offer.title}</h3>
                      <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-2">{offer.description}</p>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-xl font-bold text-purple-600 dark:text-indigo-300">
                          KES {offer.discounted_price}
                        </span>
                        <span className="text-[rgb(var(--color-muted))] line-through">
                          KES {offer.original_price}
                        </span>
                        <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2 py-1 rounded text-sm font-semibold">
                          {offer.discount_percentage}% OFF
                        </span>
                      </div>
                      
                      <div className="flex items-center text-[rgb(var(--color-muted))] text-sm mb-4">
                        <FiClock className="mr-2" />
                        <span>Valid until {new Date(offer.valid_until).toLocaleDateString()}</span>
                      </div>
                      
                      <Link href={`/offers/${offer.id}`}>
                        <Button variant="primary" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}