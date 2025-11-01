"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShoppingBag, FiStar, FiMapPin, FiGrid, FiList, FiFilter, FiChevronLeft, FiChevronRight, FiUser } from "react-icons/fi";
import FilterSidebar from "../../components/FilterSidebar";
import SellersCarousel from "../../components/SellersCarousel";
import VerificationBadge from "../../components/VerificationBadge";
import TrustIndicators from "../../components/TrustIndicators";
import ProfilePicture from "../../components/ProfilePicture";
import { api } from "../../lib/api";

interface Seller {
  id: number;
  business_name: string;
  business_description: string;
  business_logo: string;
  rating: number;
  total_reviews: number;
  total_deals: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  is_verified: boolean;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture: string;
    is_verified: boolean;
  };
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await api.get('/api/sellers/');
      setSellers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter(seller => {
    if (filters.search && !(seller.business_name || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.rating && Number(seller.rating || 0) < parseFloat(filters.rating)) return false;
    if (filters.location && !(seller.address || '').toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredSellers.length / pageSize));
  const visibleSellers = filteredSellers.slice((page - 1) * pageSize, page * pageSize);

  const filterSections = [
    {
      id: 'search',
      title: 'Search Sellers',
      type: 'search' as const
    },
    {
      id: 'rating',
      title: 'Minimum Rating',
      type: 'radio' as const,
      options: [
        { id: '4', label: '4+ Stars' },
        { id: '3', label: '3+ Stars' },
        { id: '2', label: '2+ Stars' },
        { id: '1', label: '1+ Stars' }
      ]
    },
    {
      id: 'location',
      title: 'Location',
      type: 'search' as const
    },
    {
      id: 'reviews',
      title: 'Minimum Reviews',
      type: 'range' as const,
      min: 0,
      max: 100,
      step: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Trusted Sellers</h1>
          <p className="text-xl opacity-90">Discover businesses offering amazing deals</p>
        </div>
      </div>

      {/* Featured Sellers Carousel */}
      {sellers.length > 0 && (
        <SellersCarousel 
          sellers={sellers.map(seller => ({
            id: seller.id,
            name: seller.user ? `${seller.user.first_name} ${seller.user.last_name}` : seller.business_name,
            businessName: seller.business_name,
            category: seller.total_deals > 10 ? 'Top Seller' : seller.total_deals > 5 ? 'Active Seller' : 'New Seller',
            rating: Number(seller.rating || 0),
            totalSales: seller.total_deals || 0,
            followers: seller.total_reviews || 0,
            location: seller.address,
            avatar: seller.user?.profile_picture || seller.business_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.business_name)}&background=6366f1&color=fff`,
            coverImage: seller.business_logo || `https://picsum.photos/320/128?random=${seller.id}`,
            verified: seller.is_verified,
            specialOffer: seller.is_verified ? '✓ Verified' : seller.total_deals > 20 ? '🔥 Hot Deals' : undefined
          }))}
        />
      )}

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
                    {filteredSellers.length} sellers found
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
                <p className="mt-4 text-[rgb(var(--color-muted))]">Loading sellers...</p>
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="text-center py-20">
                <FiShoppingBag className="text-[rgb(var(--color-muted))] text-6xl mx-auto mb-4" />
                <p className="text-xl text-[rgb(var(--color-muted))]">No sellers match your filters</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                : "space-y-6"
              }>
                {visibleSellers.map((seller) => {
                  if (viewMode === 'list') {
                    return (
                      <div
                        key={seller.id}
                        className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))] flex"
                      >
                        <div className="flex-1 p-6">
                          <div className="flex items-center mb-4">
                            <div className="relative mr-4">
                              <ProfilePicture
                                src={seller.user?.profile_picture || seller.business_logo}
                                alt={seller.user ? `${seller.user.first_name} ${seller.user.last_name}` : seller.business_name}
                                size="xl"
                                clickable={true}
                                className="border-2 border-purple-200 dark:border-indigo-300/40"
                              />
                              <VerificationBadge 
                                isVerified={seller.user?.is_verified || false} 
                                type="user" 
                                size="sm" 
                                className="absolute -bottom-1 -right-1"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{seller.business_name}</h3>
                                <VerificationBadge isVerified={seller.is_verified} type="seller" size="sm" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                by {seller.user?.first_name || 'Unknown'} {seller.user?.last_name || 'User'}
                              </p>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <FiStar className="text-yellow-400 dark:text-yellow-300 mr-1" />
                                <span>{Number(seller.rating || 0).toFixed(1)} ({seller.total_reviews || 0} reviews)</span>
                              </div>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <FiMapPin className="mr-2" />
                                <span>{seller.address}</span>
                              </div>
                            </div>
                            <Link href={`/sellers/${seller.id}`}>
                              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-semibold">
                                View Store
                              </button>
                            </Link>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{seller.business_description}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={seller.id}
                      className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))]"
                    >
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="relative mr-4">
                            <ProfilePicture
                              src={seller.user?.profile_picture || seller.business_logo}
                              alt={seller.user ? `${seller.user.first_name} ${seller.user.last_name}` : seller.business_name}
                              size="xl"
                              clickable={true}
                              className="border-3 border-purple-300 dark:border-purple-600 shadow-lg"
                            />
                            <VerificationBadge 
                              isVerified={seller.user?.is_verified || false} 
                              type="user" 
                              size="md" 
                              className="absolute -bottom-1 -right-1"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{seller.business_name}</h3>
                              <VerificationBadge isVerified={seller.is_verified} type="seller" size="md" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                              by {seller.user?.first_name || 'Unknown'} {seller.user?.last_name || 'User'}
                            </p>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center text-sm font-medium">
                                <FiStar className="text-yellow-500 mr-1" />
                                <span className="text-yellow-600 dark:text-yellow-400">{Number(seller.rating || 0).toFixed(1)}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">({seller.total_reviews || 0} reviews)</span>
                              </div>
                            </div>
                            <TrustIndicators size="sm" variant="minimal" />
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{seller.business_description}</p>
                        
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                          <FiMapPin className="mr-2" />
                          <span>{seller.address}</span>
                        </div>
                        
                        <Link href={`/sellers/${seller.id}`}>
                          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-full hover:shadow-xl transition-all duration-300 font-semibold backdrop-shine">
                            View Store
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filteredSellers.length > 0 && totalPages > 1 && (
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
