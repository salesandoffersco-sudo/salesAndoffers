"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiStar, FiMapPin, FiPhone, FiMail, FiGlobe, FiShoppingBag, FiUser, FiAward } from "react-icons/fi";
import Button from "../../../components/Button";
import VerificationBadge from "../../../components/VerificationBadge";
import TrustIndicators from "../../../components/TrustIndicators";
import { api } from "../../../lib/api";

interface Seller {
  id: number;
  business_name: string;
  business_description: string;
  business_logo: string;
  rating: number;
  total_reviews: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  is_verified: boolean;
  business_license: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture: string;
    is_verified: boolean;
  };
}

interface Deal {
  id: number;
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  discount_percentage: number;
  category: string;
  valid_until: string;
}

export default function SellerDetailPage() {
  const params = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSellerDetails();
      fetchSellerDeals();
    }
  }, [params.id]);

  const fetchSellerDetails = async () => {
    try {
      const response = await api.get(`/api/sellers/${params.id}/`);
      setSeller(response.data);
    } catch (error) {
      console.error("Error fetching seller:", error);
    }
  };

  const fetchSellerDeals = async () => {
    try {
      const response = await api.get(`/api/sellers/${params.id}/offers/`);
      setDeals(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching deals:", error);
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
          <Link href="/sellers">
            <Button variant="primary">Back to Sellers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Header */}
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0 relative">
              {seller.user?.profile_picture ? (
                <img
                  src={seller.user.profile_picture}
                  alt={`${seller.user.first_name} ${seller.user.last_name}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center">
                  <FiUser className="text-purple-600 text-6xl" />
                </div>
              )}
              <VerificationBadge 
                isVerified={seller.user?.is_verified || false} 
                type="user" 
                size="lg" 
                className="absolute -bottom-2 -right-2"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">{seller.business_name}</h1>
                <VerificationBadge isVerified={seller.is_verified} type="seller" size="lg" showText />
              </div>
              <p className="text-lg text-[rgb(var(--color-muted))] mb-2">
                by {seller.user?.first_name} {seller.user?.last_name}
              </p>
              {seller.business_license && (
                <div className="flex items-center gap-2 mb-4">
                  <FiAward className="text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Licensed Business: {seller.business_license}</span>
                </div>
              )}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(seller.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-[rgb(var(--color-muted))]">
                  {seller.rating.toFixed(1)} ({seller.total_reviews} reviews)
                </span>
              </div>
              <p className="text-[rgb(var(--color-muted))] mb-4">{seller.business_description}</p>
              
              <TrustIndicators className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seller.address && (
                  <div className="flex items-center text-[rgb(var(--color-muted))]">
                    <FiMapPin className="mr-2" />
                    <span>{seller.address}</span>
                  </div>
                )}
                {seller.phone && (
                  <div className="flex items-center text-[rgb(var(--color-muted))]">
                    <FiPhone className="mr-2" />
                    <span>{seller.phone}</span>
                  </div>
                )}
                {seller.email && (
                  <div className="flex items-center text-[rgb(var(--color-muted))]">
                    <FiMail className="mr-2" />
                    <span>{seller.email}</span>
                  </div>
                )}
                {seller.website && (
                  <div className="flex items-center text-[rgb(var(--color-muted))]">
                    <FiGlobe className="mr-2" />
                    <a href={seller.website} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
                      {seller.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seller Offers */}
        <div>
          <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-6">Current Offers</h2>
          {deals.length === 0 ? (
            <div className="text-center py-20">
              <FiShoppingBag className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
              <p className="text-xl text-[rgb(var(--color-muted))]">No active offers at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))]"
                >
                  <div className="p-6">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {deal.category}
                    </span>
                    
                    <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mt-4 mb-2">{deal.title}</h3>
                    <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-2">{deal.description}</p>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl font-bold text-purple-600">
                        KES {deal.discounted_price}
                      </span>
                      <span className="text-gray-400 line-through">
                        KES {deal.original_price}
                      </span>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-semibold">
                        {deal.discount_percentage}% OFF
                      </span>
                    </div>
                    
                    <Link href={`/offers/${deal.id}`}>
                      <Button variant="primary" size="md" className="w-full">
                        View Deal
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
  );
}