"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiHeart, FiClock, FiTag, FiMapPin, FiStar, FiShare2 } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

interface Offer {
  id: number;
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  discount_percentage: number;
  category: string;
  valid_until: string;
  image?: string;
  seller: {
    id: number;
    business_name: string;
    rating: number;
    address: string;
  };
}

export default function OfferDetailsPage() {
  const params = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOffer();
    }
  }, [params.id]);

  const fetchOffer = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/offers/${params.id}/`);
      setOffer(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offer:", error);
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="text-center">
          <FiTag className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Offer Not Found</h1>
          <p className="text-[rgb(var(--color-muted))] mb-4">The offer you're looking for doesn't exist.</p>
          <Link href="/offers">
            <Button variant="primary">Browse Offers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 border border-[rgb(var(--color-border))]">
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center">
              {offer.image ? (
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <FiTag className="text-6xl text-[rgb(var(--color-muted))]" />
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {offer.category}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavorite}
                    className={isFavorited ? "text-red-500 border-red-500" : ""}
                  >
                    <FiHeart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <FiShare2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-4">{offer.title}</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-purple-600 dark:text-indigo-300">
                  KES {offer.discounted_price}
                </span>
                <span className="text-xl text-[rgb(var(--color-muted))] line-through">
                  KES {offer.original_price}
                </span>
                <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {offer.discount_percentage}% OFF
                </span>
              </div>

              <div className="flex items-center text-[rgb(var(--color-muted))] mb-6">
                <FiClock className="mr-2" />
                <span>Valid until {new Date(offer.valid_until).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Description</h3>
              <p className="text-[rgb(var(--color-muted))] leading-relaxed">{offer.description}</p>
            </div>

            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/sellers/${offer.seller.id}`} className="text-purple-600 dark:text-indigo-300 font-semibold hover:underline">
                    {offer.seller.business_name}
                  </Link>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(offer.seller.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[rgb(var(--color-muted))] ml-2">
                      {offer.seller.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-[rgb(var(--color-muted))] mt-1">
                    <FiMapPin className="w-4 h-4 mr-1" />
                    {offer.seller.address}
                  </div>
                </div>
                <Link href={`/sellers/${offer.seller.id}`}>
                  <Button variant="outline" size="sm">View Profile</Button>
                </Link>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="primary" size="lg" className="flex-1">
                Contact Seller
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}