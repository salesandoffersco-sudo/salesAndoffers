"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiClock, FiTag } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";

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
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Electronics", "Fashion", "Food", "Home", "Services", "Other"];

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/offers/");
      setOffers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setLoading(false);
    }
  };

  const filteredOffers = selectedCategory === "All" 
    ? offers 
    : offers.filter(offer => offer.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Explore Amazing Offers</h1>
          <p className="text-xl opacity-90">Discover exclusive deals from verified sellers</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "primary" : "outline"}
              size="sm"
              className={selectedCategory === category ? "shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20">
            <FiTag className="text-[rgb(var(--color-muted))] text-6xl mx-auto mb-4" />
            <p className="text-xl text-[rgb(var(--color-muted))]">No offers available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer) => (
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
                    <Button variant="primary" size="md" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
