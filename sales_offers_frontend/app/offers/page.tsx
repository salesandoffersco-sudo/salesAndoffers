"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiClock, FiTag, FiGrid, FiList, FiFilter, FiChevronLeft, FiChevronRight, FiShoppingCart, FiUser } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { useCart } from "../../contexts/CartContext";

import FilterSidebar from "../../components/FilterSidebar";
import HeroCarousel from "../../components/HeroCarousel";
import VerificationBadge from "../../components/VerificationBadge";
import TrustIndicators from "../../components/TrustIndicators";
import { API_BASE_URL } from "../../lib/api";

interface Offer {
  id: number;
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  discount_percentage: number;
  category: string;
  expires_at: string;
  image?: string;
  is_favorited?: boolean;
  is_verified?: boolean;
  rating?: number;
  seller: {
    id: number;
    business_name: string;
    is_verified?: boolean;
    user?: {
      profile_picture?: string;
      first_name?: string;
      last_name?: string;
      is_verified?: boolean;
    };
  };
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const { addToCart } = useCart();

  const handleAddToCart = (offer: Offer) => {
    addToCart({
      dealId: offer.id,
      title: offer.title,
      originalPrice: parseFloat(offer.original_price),
      discountedPrice: parseFloat(offer.discounted_price),
      discountPercentage: offer.discount_percentage,
      maxPurchase: 10, // Default values since not in offer interface
      minPurchase: 1,
      availableVouchers: 100,
      expiresAt: offer.expires_at,
      seller: offer.seller
    });
  };

  const [favoriteLoading, setFavoriteLoading] = useState<number | null>(null);

  const handleFavorite = async (offerId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setFavoriteLoading(offerId);
      const response = await axios.post(
        `${API_BASE_URL}/api/accounts/deals/${offerId}/favorite/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      
      setOffers(offers.map(offer => 
        offer.id === offerId 
          ? { ...offer, is_favorited: response.data.favorited }
          : offer
      ));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(null);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchSubscription();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/deals/`);
      setOffers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/api/sellers/stats/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const canSeeFeaturedListings = () => {
    if (!subscription) return false;
    const features = subscription.plan?.features;
    return features?.featured_listings === true;
  };

  const filteredOffers = offers.filter(offer => {
    if (filters.search && !offer.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.price && parseFloat(offer.discounted_price) > filters.price) return false;
    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(offer.category)) return false;
    return true;
  });

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / pageSize));
  const visibleOffers = filteredOffers.slice((page - 1) * pageSize, page * pageSize);

  const filterSections = [
    {
      id: 'search',
      title: 'Search',
      type: 'search' as const
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'checkbox' as const,
      options: [
        { id: 'Electronics', label: 'Electronics', count: 45 },
        { id: 'Fashion', label: 'Fashion', count: 32 },
        { id: 'Food', label: 'Food & Beverages', count: 28 },
        { id: 'Home', label: 'Home & Garden', count: 19 },
        { id: 'Services', label: 'Services', count: 15 },
        { id: 'Other', label: 'Other', count: 8 }
      ]
    },
    {
      id: 'price',
      title: 'Max Price',
      type: 'range' as const,
      min: 0,
      max: 100000,
      step: 1000
    },
    {
      id: 'discount',
      title: 'Minimum Discount',
      type: 'radio' as const,
      options: [
        { id: '10', label: '10% or more' },
        { id: '25', label: '25% or more' },
        { id: '50', label: '50% or more' },
        { id: '75', label: '75% or more' }
      ]
    }
  ];

  // Mock featured items for demo (always show carousel)
  const mockFeaturedItems = [
    {
      id: 1,
      title: "Premium Wireless Headphones",
      description: "Experience crystal-clear audio with our premium wireless headphones featuring noise cancellation.",
      price: "KES 8,999",
      originalPrice: "KES 12,999",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&h=600&auto=format&fit=crop",
      category: "Electronics",
      discount: 30
    },
    {
      id: 2,
      title: "Smart Fitness Watch",
      description: "Track your health and fitness goals with this advanced smartwatch featuring heart rate monitoring.",
      price: "KES 15,999",
      originalPrice: "KES 22,999",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&h=600&auto=format&fit=crop",
      category: "Wearables",
      discount: 25
    },
    {
      id: 3,
      title: "Professional Camera",
      description: "Capture life's moments with this professional-grade camera perfect for photography enthusiasts.",
      price: "KES 45,999",
      originalPrice: "KES 65,999",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1526170375885-4a8ecf77b99f?q=80&w=400&h=600&auto=format&fit=crop",
      category: "Photography",
      discount: 35
    },
    {
      id: 4,
      title: "Designer Sneakers",
      description: "Step out in style with these premium designer sneakers crafted for comfort and fashion.",
      price: "KES 12,999",
      originalPrice: "KES 18,999",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&h=600&auto=format&fit=crop",
      category: "Fashion",
      discount: 32
    },
    {
      id: 5,
      title: "Bluetooth Speaker",
      description: "Portable wireless speaker with powerful bass and waterproof design for any adventure.",
      price: "KES 6,999",
      originalPrice: "KES 9,999",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&h=600&auto=format&fit=crop",
      category: "Audio",
      discount: 30
    },
    {
      id: 6,
      title: "Leather Dress Shoes",
      description: "Handcrafted leather dress shoes perfect for formal occasions and business meetings.",
      price: "KES 18,999",
      originalPrice: "KES 28,999",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=400&h=600&auto=format&fit=crop",
      category: "Fashion",
      discount: 35
    }
  ];

  // Use real offers if available, otherwise use mock data
  const featuredItems = offers.length > 0 
    ? offers.slice(0, 6).map(offer => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        price: `KES ${offer.discounted_price}`,
        originalPrice: `KES ${offer.original_price}`,
        rating: 4.5,
        image: offer.image || `https://images.unsplash.com/photo-${1526170375885 + offer.id}?q=80&w=400&h=600&auto=format&fit=crop`,
        category: offer.category,
        discount: offer.discount_percentage
      }))
    : mockFeaturedItems;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Hero Carousel Section - Always show */}
      <HeroCarousel items={featuredItems} />

      <div className="flex">
        <FilterSidebar
          isOpen={filterOpen}
          onToggle={() => setFilterOpen(!filterOpen)}
          onFiltersChange={setFilters}
          sections={filterSections}
        />

        <div className="flex-1">
          <div className="sticky top-16 z-30 bg-[rgb(var(--color-bg))] border-b border-[rgb(var(--color-border))] py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setFilterOpen(true)}
                    className="lg:hidden mr-3 p-2 rounded border border-[rgb(var(--color-border))] text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))]"
                    aria-label="Open filters"
                  >
                    <FiFilter className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[rgb(var(--color-muted))]">
                    {filteredOffers.length} offers found
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-[rgb(var(--color-muted))]">Loading offers...</p>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-20">
                <FiTag className="text-[rgb(var(--color-muted))] text-6xl mx-auto mb-4" />
                <p className="text-xl text-[rgb(var(--color-muted))]">No offers match your filters</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                : "space-y-6"
              }>
                {visibleOffers.map((offer, index) => {
                  const isFeatured = index < 3 && canSeeFeaturedListings();
                  
                  if (viewMode === 'list') {
                    return (
                      <div
                        key={offer.id}
                        className={`bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border flex ${
                          isFeatured 
                            ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
                            : 'border-[rgb(var(--color-border))]'
                        }`}
                      >
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                                {offer.category}
                              </span>
                              <VerificationBadge isVerified={offer.is_verified || false} type="deal" size="sm" />
                              {isFeatured && (
                                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => handleFavorite(offer.id)}
                              disabled={favoriteLoading === offer.id}
                              className={`transition-colors relative ${
                                offer.is_favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                              } ${favoriteLoading === offer.id ? 'opacity-50' : ''}`}
                            >
                              {favoriteLoading === offer.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                              ) : (
                                <FiHeart className={`text-xl ${offer.is_favorited ? 'fill-current' : ''}`} />
                              )}
                            </button>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{offer.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{offer.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                KES {offer.discounted_price}
                              </span>
                              <span className="text-gray-400 line-through text-lg">
                                KES {offer.original_price}
                              </span>
                              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                {offer.discount_percentage}% OFF
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToCart(offer)}
                              >
                                <FiShoppingCart className="w-4 h-4" />
                              </Button>
                              <Link href={`/offers/${offer.id}`}>
                                <Button variant="primary" size="md">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={offer.id}
                      className={`bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                        isFeatured 
                          ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
                          : 'border-[rgb(var(--color-border))]'
                      }`}
                    >
                      {isFeatured && (
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold">
                          ⭐ Featured Listing
                        </div>
                      )}
                      {/* Offer Image */}
                      {offer.image && (
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                          <img 
                            src={offer.image} 
                            alt={offer.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {offer.category}
                          </span>
                          <button 
                            onClick={() => handleFavorite(offer.id)}
                            className={`transition-colors ${
                              offer.is_favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <FiHeart className={`text-2xl ${offer.is_favorited ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{offer.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{offer.description}</p>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            KES {offer.discounted_price}
                          </span>
                          <span className="text-gray-400 line-through text-lg">
                            KES {offer.original_price}
                          </span>
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {offer.discount_percentage}% OFF
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                          <FiClock className="mr-2" />
                          <span>Valid until {new Date(offer.expires_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            {offer.seller.user?.profile_picture ? (
                              <img
                                src={offer.seller.user.profile_picture}
                                alt={offer.seller.user.first_name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                <FiUser className="w-3 h-3 text-purple-600" />
                              </div>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              By <span className="font-semibold text-purple-600 dark:text-indigo-300">{offer.seller.business_name}</span>
                            </p>
                            <VerificationBadge isVerified={offer.seller.is_verified || false} type="seller" size="sm" />
                          </div>
                          <TrustIndicators size="sm" className="mb-3" />
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="md"
                              onClick={() => handleAddToCart(offer)}
                              className="flex-1"
                            >
                              <FiShoppingCart className="w-4 h-4 mr-1" />
                              Add to Cart
                            </Button>
                            <Link href={`/offers/${offer.id}`} className="flex-1">
                              <Button variant="primary" size="md" className="w-full">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filteredOffers.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgb(var(--color-ui))]'}`}
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-[rgb(var(--color-muted))]">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgb(var(--color-ui))]'}`}
                >
                  Next
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
