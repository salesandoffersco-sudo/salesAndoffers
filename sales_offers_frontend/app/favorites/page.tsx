"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiClock, FiTag, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface FavoriteOffer {
  id: number;
  offer: {
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
  };
  created_at: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/accounts/favorites/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setFavorites(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/accounts/favorites/${favoriteId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <FiHeart className="text-4xl" />
            <div>
              <h1 className="text-4xl font-bold">My Favorites</h1>
              <p className="text-xl opacity-90">Your saved offers and deals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">No Favorites Yet</h2>
            <p className="text-[rgb(var(--color-muted))] mb-6">Start browsing offers and save your favorites here!</p>
            <Link href="/offers">
              <Button variant="primary">Browse Offers</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">
                {favorites.length} Saved {favorites.length === 1 ? 'Offer' : 'Offers'}
              </h2>
              <p className="text-[rgb(var(--color-muted))]">
                Keep track of deals you love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))]"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                        {favorite.offer.category}
                      </span>
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove from favorites"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mb-2">
                      {favorite.offer.title}
                    </h3>
                    <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-2">
                      {favorite.offer.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl font-bold text-purple-600 dark:text-indigo-300">
                        KES {favorite.offer.discounted_price}
                      </span>
                      <span className="text-[rgb(var(--color-muted))] line-through">
                        KES {favorite.offer.original_price}
                      </span>
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2 py-1 rounded text-sm font-semibold">
                        {favorite.offer.discount_percentage}% OFF
                      </span>
                    </div>
                    
                    <div className="flex items-center text-[rgb(var(--color-muted))] text-sm mb-4">
                      <FiClock className="mr-2" />
                      <span>Valid until {new Date(favorite.offer.valid_until).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="border-t border-[rgb(var(--color-border))] pt-4">
                      <p className="text-sm text-[rgb(var(--color-muted))] mb-3">
                        By <span className="font-semibold text-purple-600 dark:text-indigo-300">
                          {favorite.offer.seller.business_name}
                        </span>
                      </p>
                      <div className="flex space-x-2">
                        <Link href={`/offers/${favorite.offer.id}`} className="flex-1">
                          <Button variant="primary" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/sellers/${favorite.offer.seller.id}`}>
                          <Button variant="outline" size="sm">
                            Seller
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}