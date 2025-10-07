"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShoppingBag, FiStar, FiMapPin } from "react-icons/fi";
import axios from "axios";

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

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/sellers/");
      setSellers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Trusted Sellers</h1>
          <p className="text-xl opacity-90">Discover businesses offering amazing deals</p>
        </div>
      </div>

      {/* Sellers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading sellers...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-20">
            <FiShoppingBag className="text-[rgb(var(--color-muted))] text-6xl mx-auto mb-4" />
            <p className="text-xl text-[rgb(var(--color-muted))]">No sellers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellers.map((seller) => (
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
                  
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-full hover:shadow-lg transition-all duration-300 font-semibold">
                    View Seller Offers
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
