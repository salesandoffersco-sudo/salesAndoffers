"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { useCart } from "../../contexts/CartContext";
import { API_BASE_URL } from "../../lib/api";

interface Favorite {
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
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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

  const handleRemoveFavorite = async (favoriteId: number) => {
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

  const handleAddToCart = (offer: Favorite['offer']) => {
    addToCart({
      dealId: offer.id,
      title: offer.title,
      originalPrice: parseFloat(offer.original_price),
      discountedPrice: parseFloat(offer.discounted_price),
      discountPercentage: offer.discount_percentage,
      maxPurchase: 10,
      minPurchase: 1,
      availableVouchers: 100,
      expiresAt: offer.valid_until,
      seller: offer.seller
    });
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-8">My Favorites</h1>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <p className="text-xl text-[rgb(var(--color-muted))] mb-4">No favorites yet</p>
            <Link href="/offers">
              <Button variant="primary">Browse Offers</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))]"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {favorite.offer.category}
                    </span>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mb-2">
                    {favorite.offer.title}
                  </h3>
                  <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-2">
                    {favorite.offer.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      KES {favorite.offer.discounted_price}
                    </span>
                    <span className="text-gray-400 line-through">
                      KES {favorite.offer.original_price}
                    </span>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-semibold">
                      {favorite.offer.discount_percentage}% OFF
                    </span>
                  </div>
                  
                  <div className="border-t border-[rgb(var(--color-border))] pt-4">
                    <p className="text-sm text-[rgb(var(--color-muted))] mb-3">
                      by {favorite.offer.seller.business_name}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleAddToCart(favorite.offer)}
                        className="flex-1"
                      >
                        <FiShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Link href={`/offers/${favorite.offer.id}`} className="flex-1">
                        <Button variant="primary" size="md" className="w-full">
                          View Deal
                        </Button>
                      </Link>
                    </div>
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