"use client";

// Updated to show business logos instead of profile pictures
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiClock, FiTag, FiGrid, FiList, FiFilter, FiChevronLeft, FiChevronRight, FiShoppingCart, FiUser } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import ProfilePicture from "../../components/ProfilePicture";
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
  main_image?: string;
  images?: Array<{
    id: number;
    image_url: string;
    is_main: boolean;
    order: number;
    alt_text?: string;
  }>;
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



  // Use real offers if available, otherwise use mock data
  const featuredItems = offers.length > 0 
    ? offers.slice(0, 6).map(offer => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        discounted_price: parseFloat(offer.discounted_price),
        original_price: parseFloat(offer.original_price),
        average_rating: 4.5,
        main_image: offer.main_image || offer.image || `https://picsum.photos/400/600?random=${offer.id}`,
        category: offer.category,
        discount_percentage: offer.discount_percentage
      }))
    : [];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Hero Carousel Section - Show only if we have items */}
      {featuredItems.length > 0 && <HeroCarousel items={featuredItems} />}

      <div className="flex">
        <FilterSidebar
          isOpen={filterOpen}
          onToggle={() => setFilterOpen(!filterOpen)}
          onFiltersChange={setFilters}
          sections={filterSections}
        />

        <div className="flex-1">
          <div className="sticky top-16 z-10 bg-[rgb(var(--color-bg))] border-b border-[rgb(var(--color-border))] py-4">
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
                        className={`bg-[rgb(var(--color-card))] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                          isFeatured 
                            ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
                            : 'border-[rgb(var(--color-border))]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Image Section */}
                          {(offer.main_image || offer.image) && (
                            <div className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                              <img 
                                src={offer.main_image || offer.image} 
                                alt={offer.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Content Section */}
                          <div className="flex-1 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-2 py-1 rounded-full text-xs font-semibold">
                                    {offer.category}
                                  </span>
                                  <VerificationBadge isVerified={offer.is_verified || false} type="deal" size="sm" />
                                  {isFeatured && (
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                      ⭐ Featured
                                    </span>
                                  )}
                                </div>
                                
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{offer.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-2">{offer.description}</p>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                      KES {offer.discounted_price}
                                    </span>
                                    <span className="text-gray-400 line-through text-sm">
                                      KES {offer.original_price}
                                    </span>
                                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                      {offer.discount_percentage}% OFF
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                    <FiClock className="mr-1" />
                                    <span>Until {new Date(offer.expires_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                {/* Seller Info */}
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                  <ProfilePicture
                                    src={offer.seller.company_logo || offer.seller.user?.profile_picture}
                                    alt={offer.seller.business_name}
                                    size="xs"
                                    clickable={true}
                                  />
                                  <span>
                                    By <span className="font-semibold text-purple-600 dark:text-indigo-300">{offer.seller.business_name}</span>
                                  </span>
                                  <VerificationBadge isVerified={offer.seller.is_verified || false} type="seller" size="sm" />
                                </div>
                              </div>
                              
                              {/* Actions Section */}
                              <div className="flex sm:flex-col items-center gap-2">
                                <button 
                                  onClick={() => handleFavorite(offer.id)}
                                  disabled={favoriteLoading === offer.id}
                                  className={`transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                    offer.is_favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                  } ${favoriteLoading === offer.id ? 'opacity-50' : ''}`}
                                >
                                  {favoriteLoading === offer.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                                  ) : (
                                    <FiHeart className={`text-lg ${offer.is_favorited ? 'fill-current' : ''}`} />
                                  )}
                                </button>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddToCart(offer)}
                                  >
                                    <FiShoppingCart className="w-4 h-4" />
                                  </Button>
                                  <Link href={`/offers/${offer.id}`}>
                                    <Button variant="primary" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </div>
                              </div>
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
                      {(offer.main_image || offer.image) && (
                        <div className="bg-gray-100 dark:bg-gray-800 relative">
                          <img 
                            src={offer.main_image || offer.image} 
                            alt={offer.title}
                            className="w-full h-auto object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          {/* Image count indicator */}
                          {offer.images && offer.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                              +{offer.images.length - 1} more
                            </div>
                          )}
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
                            <ProfilePicture
                              src={offer.seller.company_logo || offer.seller.user?.profile_picture}
                              alt={offer.seller.business_name}
                              size="sm"
                              clickable={true}
                            />
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
