"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiHeart, FiClock, FiTag, FiMapPin, FiStar, FiShare2, FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { useCart } from "../../../contexts/CartContext";
import { API_BASE_URL } from "../../../lib/api";
import ProfilePicture from "../../../components/ProfilePicture";
import DealImageGallery from "../../../components/DealImageGallery";
import ContactButton from "../../../components/ContactButton";

interface Deal {
  id: number;
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  discount_percentage: number;
  category: string;
  location: string;
  max_vouchers: number;
  min_purchase: number;
  max_purchase: number;
  vouchers_sold: number;
  vouchers_available: number;
  redemption_instructions: string;
  expires_at: string;
  redemption_deadline: string;
  image?: string;
  main_image?: string;
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
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

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

  const handleQuantityChange = (change: number) => {
    if (!deal) return;
    const newQuantity = quantity + change;
    if (newQuantity >= deal.min_purchase && newQuantity <= deal.max_purchase && newQuantity <= deal.vouchers_available) {
      setQuantity(newQuantity);
    }
  };

  const { addToCart, openCart } = useCart();

  const handleAddToCart = () => {
    if (!deal) return;
    
    addToCart({
      dealId: deal.id,
      title: deal.title,
      image: deal.image,
      originalPrice: parseFloat(deal.original_price),
      discountedPrice: parseFloat(deal.discounted_price),
      discountPercentage: deal.discount_percentage,
      maxPurchase: deal.max_purchase,
      minPurchase: deal.min_purchase,
      availableVouchers: deal.vouchers_available,
      expiresAt: deal.expires_at,
      seller: deal.seller
    });
    
    openCart();
  };

  const handleBuyNow = async () => {
    if (!deal) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setPurchasing(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/initialize/`,
        {
          deal_id: deal.id,
          quantity: quantity
        },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      // Redirect to Paystack checkout
      window.location.href = response.data.authorization_url;
    } catch (error: any) {
      console.error("Error initializing payment:", error);
      alert(error.response?.data?.error || "Failed to initialize payment");
      setPurchasing(false);
    }
  };

  const totalAmount = deal ? parseFloat(deal.discounted_price) * quantity : 0;
  const savings = deal ? (parseFloat(deal.original_price) - parseFloat(deal.discounted_price)) * quantity : 0;

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
            
            {/* Availability Info */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--color-muted))]">Vouchers Available:</span>
                <span className="font-semibold text-[rgb(var(--color-fg))]">{deal.vouchers_available} / {deal.max_vouchers}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(deal.vouchers_sold / deal.max_vouchers) * 100}%` }}
                ></div>
              </div>
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
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-purple-600 dark:text-indigo-300">
                  KES {deal.discounted_price}
                </span>
                <span className="text-xl text-[rgb(var(--color-muted))] line-through">
                  KES {deal.original_price}
                </span>
                <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {deal.discount_percentage}% OFF
                </span>
              </div>

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
                  <FiTag className="mr-2" />
                  <span>Redeem by: {new Date(deal.redemption_deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">Purchase Voucher</h3>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[rgb(var(--color-muted))]">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= deal.min_purchase}
                  >
                    <FiMinus className="w-4 h-4" />
                  </Button>
                  <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= deal.max_purchase || quantity >= deal.vouchers_available}
                  >
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-[rgb(var(--color-muted))] mb-4">
                Min: {deal.min_purchase} • Max: {deal.max_purchase}
              </div>
              
              <div className="border-t border-[rgb(var(--color-border))] pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>KES {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>You save:</span>
                  <span>KES {savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-[rgb(var(--color-border))] pt-2">
                  <span>Total:</span>
                  <span>KES {totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={deal.vouchers_available === 0}
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleBuyNow}
                  disabled={purchasing || deal.vouchers_available === 0}
                >
                  {purchasing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Buy Now - KES {totalAmount.toFixed(2)}
                    </div>
                  )}
                </Button>
              </div>
              
              {deal.vouchers_available === 0 && (
                <p className="text-red-500 text-sm mt-2 text-center">This deal is sold out</p>
              )}
            </div>

            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Description</h3>
              <p className="text-[rgb(var(--color-muted))] leading-relaxed">{deal.description}</p>
            </div>
            
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Redemption Instructions</h3>
              <p className="text-[rgb(var(--color-muted))] leading-relaxed">{deal.redemption_instructions}</p>
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
    </div>
  );
}