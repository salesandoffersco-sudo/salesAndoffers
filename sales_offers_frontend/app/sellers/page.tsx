"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShoppingBag, FiStar, FiMapPin, FiGrid, FiList, FiFilter } from "react-icons/fi";
import axios from "axios";

import FilterSidebar from "../../components/FilterSidebar";
import { API_BASE_URL } from "../../lib/api";

interface Seller {
  id: number;
  business_name: string;
  business_description: string;
  business_logo: string;
  rating: number;
  total_reviews: number;
  address: string;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sellers/`);
      setSellers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter(seller => {
    if (filters.search && !seller.business_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.rating && seller.rating < parseFloat(filters.rating)) return false;
    if (filters.location && !seller.address.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {filteredSellers.map((seller) => {
                  if (viewMode === 'list') {
                    return (
                      <div
                        key={seller.id}
                        className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))] flex"
                      >
                        <div className="flex-1 p-6">
                          <div className="flex items-center mb-4">
                            {seller.business_logo ? (
                              <img
                                src={seller.business_logo}
                                alt={seller.business_name}
                                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-purple-200 dark:border-indigo-300/40"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-indigo-900/40 flex items-center justify-center mr-4">
                                <FiShoppingBag className="text-purple-600 dark:text-indigo-400 text-3xl" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{seller.business_name}</h3>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <FiStar className="text-yellow-400 dark:text-yellow-300 mr-1" />
                                <span>{seller.rating} ({seller.total_reviews} reviews)</span>
                              </div>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <FiMapPin className="mr-2" />
                                <span>{seller.address}</span>
                              </div>
                            </div>
                            <Link href={`/sellers/${seller.id}`}>
                              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-semibold">
                                View Offers
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
                          {seller.business_logo ? (
                            <img
                              src={seller.business_logo}
                              alt={seller.business_name}
                              className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-purple-200 dark:border-indigo-300/40"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-indigo-900/40 flex items-center justify-center mr-4">
                              <FiShoppingBag className="text-purple-600 dark:text-indigo-400 text-3xl" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{seller.business_name}</h3>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <FiStar className="text-yellow-400 dark:text-yellow-300 mr-1" />
                              <span>{seller.rating} ({seller.total_reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{seller.business_description}</p>
                        
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                          <FiMapPin className="mr-2" />
                          <span>{seller.address}</span>
                        </div>
                        
                        <Link href={`/sellers/${seller.id}`}>
                          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-full hover:shadow-lg transition-all duration-300 font-semibold">
                            View Seller Offers
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}