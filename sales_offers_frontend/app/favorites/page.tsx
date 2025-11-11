"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiTrendingUp, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import StoreSelectionModal from "../../components/StoreSelectionModal";
import { API_BASE_URL } from "../../lib/api";

interface Favorite {
  id: number;
  deal: {
    id: number;
    title: string;
    description: string;
    best_price?: string;
    price_range?: string;
    store_count?: number;
    category: string;
    expires_at: string;
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
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Favorite['deal'] | null>(null);

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

  const handleRemoveFavorite = async (dealId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/accounts/deals/${dealId}/favorite/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      setFavorites(favorites.filter(fav => fav.deal.id !== dealId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleComparePrices = (deal: Favorite['deal']) => {
    setSelectedDeal(deal);
    setShowStoreModal(true);
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
                      {favorite.deal.category}
                    </span>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.deal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mb-2">
                    {favorite.deal.title}
                  </h3>
                  <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-2">
                    {favorite.deal.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {favorite.deal.price_range || `KSh ${favorite.deal.best_price || 'Price varies'}`}
                    </span>
                    {favorite.deal.store_count && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-semibold">
                        {favorite.deal.store_count} store{favorite.deal.store_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="border-t border-[rgb(var(--color-border))] pt-4">
                    <p className="text-sm text-[rgb(var(--color-muted))] mb-3">
                      by {favorite.deal.seller.business_name}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleComparePrices(favorite.deal)}
                        className="flex-1"
                      >
                        <FiTrendingUp className="w-4 h-4 mr-1" />
                        Compare Prices
                      </Button>
                      <Link href={`/offers/${favorite.deal.id}`} className="flex-1">
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
      
      {selectedDeal && (
        <StoreSelectionModal
          isOpen={showStoreModal}
          onClose={() => {
            setShowStoreModal(false);
            setSelectedDeal(null);
          }}
          stores={[]}
          dealTitle={selectedDeal.title}
        />
      )}
    </div>
  );
}