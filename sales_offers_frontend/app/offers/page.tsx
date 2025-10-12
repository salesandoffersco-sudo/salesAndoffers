"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiClock, FiTag, FiGrid, FiList, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";

import FilterSidebar from "../../components/FilterSidebar";
import { API_BASE_URL } from "../../lib/api";

interface Offer {
  id: number;
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  discount_percentage: number;
  category: string;
  valid_until: string;
  seller: {
    id: number;
    business_name: string;
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

  useEffect(() => {
    fetchOffers();
    fetchSubscription();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/offers/`);
      setOffers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offers:", error);
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

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Explore Amazing Offers</h1>
          <p className="text-xl opacity-90">Discover exclusive deals from verified sellers</p>
        </div>
      </div>

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
                            <div className="flex items-center space-x-3">
                              <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                                {offer.category}
                              </span>
                              {isFeatured && (
                                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                              <FiHeart className="text-xl" />
                            </button>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{offer.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{offer.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-purple-600 dark:text-indigo-300">
                                KES {offer.discounted_price}
                              </span>
                              <span className="text-gray-400 line-through">
                                KES {offer.original_price}
                              </span>
                              <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2 py-1 rounded text-sm font-semibold">
                                {offer.discount_percentage}% OFF
                              </span>
                            </div>
                            <Link href={`/offers/${offer.id}`}>
                              <Button variant="primary" size="md">
                                View Details
                              </Button>
                            </Link>
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
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {offer.category}
                          </span>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <FiHeart className="text-2xl" />
                          </button>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{offer.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{offer.description}</p>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-2xl font-bold text-purple-600 dark:text-indigo-300">
                            KES {offer.discounted_price}
                          </span>
                          <span className="text-gray-400 line-through">
                            KES {offer.original_price}
                          </span>
                          <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2 py-1 rounded text-sm font-semibold">
                            {offer.discount_percentage}% OFF
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                          <FiClock className="mr-2" />
                          <span>Valid until {new Date(offer.valid_until).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            By <span className="font-semibold text-purple-600 dark:text-indigo-300">{offer.seller.business_name}</span>
                          </p>
                          <Link href={`/offers/${offer.id}`}>
                            <Button variant="primary" size="md" className="w-full">
                              View Details
                            </Button>
                          </Link>
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
