"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiStar, FiMapPin, FiPhone, FiMail, FiGlobe, FiShoppingBag, FiUser, FiAward } from "react-icons/fi";
import Button from "../../../components/Button";
import VerificationBadge from "../../../components/VerificationBadge";
import TrustIndicators from "../../../components/TrustIndicators";
import ProfilePicture from "../../../components/ProfilePicture";
import ContactButton from "../../../components/ContactButton";
import { api } from "../../../lib/api";

interface Seller {
  id: number;
  business_name: string;
  business_description: string;
  business_logo: string;
  cover_image?: string;
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
    profile_picture?: string;
    google_picture?: string;
    is_verified: boolean;
  };
  profile?: {
    company_logo: string;
    cover_image: string;
    is_published: boolean;
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
  expires_at: string;
  main_image?: string;
  images?: Array<{
    id: number;
    image_url: string;
    is_main: boolean;
    order: number;
    alt_text?: string;
  }>;
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
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden mb-8">
          {/* Cover Image */}
          {(seller.profile?.cover_image || seller.cover_image) && (
            <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 relative">
              <img 
                src={seller.profile?.cover_image || seller.cover_image} 
                alt={`${seller.business_name} cover`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30" />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0 relative">
                <ProfilePicture
                  src={seller.profile?.company_logo || seller.business_logo || seller.user?.profile_picture || seller.user?.google_picture}
                  size="xl"
                  className="border-4 border-purple-200"
                />
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
                by {seller.user?.first_name || 'Unknown'} {seller.user?.last_name || 'User'}
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
                      className={`w-5 h-5 ${i < Math.floor(Number(seller.rating || 0)) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-[rgb(var(--color-muted))]">
                  {Number(seller.rating || 0).toFixed(1)} ({seller.total_reviews || 0} reviews)
                </span>
              </div>
              <p className="text-[rgb(var(--color-muted))] mb-4">{seller.business_description}</p>
              
              <TrustIndicators className="mb-6" />
              
              <ContactButton
                recipientId={seller.user?.id || 0}
                recipientName={seller.business_name}
                context={{
                  type: 'seller',
                  title: seller.business_name,
                  id: seller.id
                }}
                variant="primary"
                size="lg"
                className="mb-6"
              />
              
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
                  {/* Deal Image */}
                  {deal.main_image && (
                    <div className="bg-gray-100 dark:bg-gray-800 relative">
                      <img 
                        src={deal.main_image} 
                        alt={deal.title}
                        className="w-full h-48 object-cover"
                      />
                      {/* Image count indicator */}
                      {deal.images && deal.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          +{deal.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}
                  
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