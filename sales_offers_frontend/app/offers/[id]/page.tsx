"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiHeart, FiClock, FiTag, FiMapPin, FiStar, FiShare2, FiExternalLink } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";
import ProfilePicture from "../../../components/ProfilePicture";
import DealImageGallery from "../../../components/DealImageGallery";
import ContactButton from "../../../components/ContactButton";
import StoreSelectionModal from "../../../components/StoreSelectionModal";
import PhysicalStoreList from "../../../components/PhysicalStoreList";

interface StoreLink {
  id: number;
  store_name: string;
  store_url: string;
  price: number;
  coupon_code?: string;
  coupon_discount?: string;
  is_available: boolean;
  store_info?: {
    name: string;
    logo: string;
    color: string;
  };
}

interface Deal {
  id: number;
  title: string;
  description: string;
  best_price?: number;
  category: string;
  location: string;
  expires_at: string;
  image?: string;
  main_image?: string;
  store_links?: StoreLink[];
  physical_stores?: any[];
  store_count?: number;
  lowest_price?: number;
  images?: Array<{
    id: number;
    image_url: string;
    is_main: boolean;
    order: number;
    alt_text?: string;
  }>;
  seller: {
    id: number;
    business_name: string;
    rating: number;
    address: string;
    profile?: {
      company_logo?: string;
      cover_image?: string;
    };
    user?: {
      id: number;
      profile_picture?: string;
      google_picture?: string;
    };
  };
}

export default function DealDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDeal();
    }
  }, [params.id]);

  const fetchDeal = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/deals/${params.id}/`);
      setDeal(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching deal:", error);
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleAddToFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/accounts/deals/${deal?.id}/favorite/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setIsFavorited(true);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="text-center">
          <FiTag className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Deal Not Found</h1>
          <p className="text-[rgb(var(--color-muted))] mb-4">The deal you're looking for doesn't exist.</p>
          <Link href="/offers">
            <Button variant="primary">Browse Deals</Button>
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
            <DealImageGallery
              images={deal.images || []}
              mainImage={deal.main_image || deal.image}
              title={deal.title}
            />

            {/* Store Availability Info */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--color-muted))]">Available Stores:</span>
                <span className="font-semibold text-[rgb(var(--color-fg))]">
                  {deal.store_links?.filter(store => store.is_available).length || 0} stores
                </span>
              </div>
              {deal.lowest_price && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[rgb(var(--color-muted))]">Best Price:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    KSh {deal.lowest_price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-100 dark:bg-indigo-900/40 text-purple-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {deal.category}
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

              <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-4">{deal.title}</h1>

              {deal.lowest_price && (
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-purple-600 dark:text-indigo-300">
                    From KSh {deal.lowest_price.toLocaleString()}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {deal.store_count} Store{(deal.store_count || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div className="space-y-2 text-sm text-[rgb(var(--color-muted))] mb-6">
                <div className="flex items-center">
                  <FiClock className="mr-2" />
                  <span>Deal expires: {new Date(deal.expires_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-2" />
                  <span>Location: {deal.location}</span>
                </div>
                <div className="flex items-center">
                  <FiExternalLink className="mr-2" />
                  <span>Available in {deal.store_count || 0} store{(deal.store_count || 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Store Comparison Section */}
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">View Stores</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isFavorited ? handleFavorite : handleAddToFavorites}
                  className={isFavorited ? "text-red-500 border-red-500" : ""}
                >
                  <FiHeart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                  {isFavorited ? 'Saved' : 'Save Deal'}
                </Button>
              </div>

              <div className="space-y-4">
                {deal.store_links && deal.store_links.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {deal.store_links.slice(0, 4).map((store) => (
                        <div key={store.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                              {store.store_info?.logo ? (
                                <img src={store.store_info.logo} alt={store.store_name} className="w-6 h-6 object-contain" />
                              ) : (
                                <span className="text-xs font-bold">{store.store_name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{store.store_name}</span>
                              {store.coupon_code && (
                                <p className="text-xs text-green-600">Code: {store.coupon_code}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-purple-600">KSh {store.price.toLocaleString()}</span>
                            {store.coupon_discount && (
                              <p className="text-xs text-green-600">Save {store.coupon_discount}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setShowStoreModal(true)}
                    >
                      Compare All {deal.store_links.length} Stores
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-[rgb(var(--color-muted))]">
                    <FiExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No store links available for this deal.</p>
                    <Button
                      variant="primary"
                      className="mt-4"
                      onClick={() => setShowStoreModal(true)}
                    >
                      View Sample Stores
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <PhysicalStoreList stores={deal.physical_stores || []} />

            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Description</h3>
              <p className="text-[rgb(var(--color-muted))] leading-relaxed">{deal.description}</p>
            </div>



            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">Merchant Information</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ProfilePicture
                    src={deal.seller.profile?.company_logo || deal.seller.user?.profile_picture || deal.seller.user?.google_picture}
                    size="md"
                  />
                  <div>
                    <Link href={`/sellers/${deal.seller.id}`} className="text-purple-600 dark:text-indigo-300 font-semibold hover:underline">
                      {deal.seller.business_name}
                    </Link>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(Number(deal.seller.rating) || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[rgb(var(--color-muted))] ml-2">
                        {typeof deal.seller.rating === 'number' ? deal.seller.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-[rgb(var(--color-muted))] mt-1">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      {deal.seller.address}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/sellers/${deal.seller.id}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                  <ContactButton
                    recipientId={deal.seller.user?.id || deal.seller.id}
                    recipientName={deal.seller.business_name}
                    context={{
                      type: 'offer',
                      title: deal.title,
                      id: deal.id
                    }}
                    variant="primary"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreSelectionModal
        isOpen={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        stores={deal.store_links || []}
        physicalStores={deal.physical_stores || []}
        dealTitle={deal.title}
      />
    </div>
  );
}