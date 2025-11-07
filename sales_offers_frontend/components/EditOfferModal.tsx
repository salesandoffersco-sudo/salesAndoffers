"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import Button from "./Button";
import DealImageUpload from "./DealImageUpload";
import StoreLinkManager from "./StoreLinkManager";
import { api } from "../lib/api";

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  offerId: number;
}

interface OfferData {
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  category: string;
  location: string;
  max_vouchers: number;
  min_purchase: number;
  max_purchase: number;
  redemption_instructions: string;
  expires_at: string;
}

export default function EditOfferModal({ isOpen, onClose, onSuccess, offerId }: EditOfferModalProps) {
  const [formData, setFormData] = useState<OfferData>({
    title: "",
    description: "",
    original_price: "",
    discounted_price: "",
    category: "Other",
    location: "",
    max_vouchers: 100,
    min_purchase: 1,
    max_purchase: 10,
    redemption_instructions: "Present this voucher at the business location to redeem your deal.",
    expires_at: ""
  });
  const [images, setImages] = useState<any[]>([]);
  const [storeLinks, setStoreLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isOpen && offerId) {
      fetchOfferData();
    }
  }, [isOpen, offerId]);

  const fetchOfferData = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get(`/api/deals/${offerId}/`);
      const offer = response.data;
      
      setFormData({
        title: offer.title,
        description: offer.description,
        original_price: offer.original_price,
        discounted_price: offer.discounted_price,
        category: offer.category,
        location: offer.location || "",
        max_vouchers: offer.max_vouchers,
        min_purchase: offer.min_purchase,
        max_purchase: offer.max_purchase,
        redemption_instructions: offer.redemption_instructions,
        expires_at: offer.expires_at ? new Date(offer.expires_at).toISOString().split('T')[0] : ""
      });
      
      // Set existing images
      const existingImages = offer.images || [];
      if (offer.main_image && !existingImages.some((img: any) => img.image_url === offer.main_image)) {
        existingImages.unshift({
          id: -1,
          image_url: offer.main_image,
          is_main: true,
          order: -1,
          alt_text: offer.title
        });
      }
      setImages(existingImages);
    } catch (error) {
      console.error("Error fetching offer:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const discountPercentage = Math.round(
        ((parseFloat(formData.original_price) - parseFloat(formData.discounted_price)) / 
         parseFloat(formData.original_price)) * 100
      );

      const submitData = {
        ...formData,
        discount_percentage: discountPercentage,
        expires_at: new Date(formData.expires_at).toISOString(),
        main_image: images.find(img => img.is_main)?.image_url || images[0]?.image_url || null
      };

      await api.patch(`/api/deals/${offerId}/`, submitData);
      
      // Update images
      if (images.length > 0) {
        // Delete existing images and re-upload (simple approach)
        try {
          const existingImagesResponse = await api.get(`/api/deals/${offerId}/`);
          const existingImages = existingImagesResponse.data.images || [];
          
          // Delete old images
          for (const img of existingImages) {
            if (img.id > 0) {
              await api.delete(`/api/deals/${offerId}/images/${img.id}/delete/`);
            }
          }
          
          // Upload new images
          for (const image of images) {
            if (image.id !== -1) { // Skip the legacy main_image entry
              await api.post(`/api/deals/${offerId}/images/`, {
                image_url: image.image_url,
                is_main: image.is_main,
                alt_text: image.alt_text
              });
            }
          }
        } catch (imageError) {
          console.error('Error updating images:', imageError);
        }
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating offer:", error);
      alert(error.response?.data?.error || "Failed to update offer");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[rgb(var(--color-card))] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[rgb(var(--color-border))]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">Edit Offer</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--color-ui))] rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {fetchLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-[rgb(var(--color-muted))]">Loading offer data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Offer Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter offer title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your offer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Original Price (KES) *
                </label>
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Discounted Price (KES) *
                </label>
                <input
                  type="number"
                  name="discounted_price"
                  value={formData.discounted_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food">Food & Beverages</option>
                  <option value="Home">Home & Garden</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Business location"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Deal Images
                </label>
                <DealImageUpload
                  dealId={offerId}
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                />
              </div>

              <div className="md:col-span-2">
                <StoreLinkManager 
                  storeLinks={storeLinks} 
                  onChange={setStoreLinks} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Max Vouchers *
                </label>
                <input
                  type="number"
                  name="max_vouchers"
                  value={formData.max_vouchers}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Expires At *
                </label>
                <input
                  type="date"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Min Purchase *
                </label>
                <input
                  type="number"
                  name="min_purchase"
                  value={formData.min_purchase}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Max Purchase *
                </label>
                <input
                  type="number"
                  name="max_purchase"
                  value={formData.max_purchase}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Redemption Instructions
                </label>
                <textarea
                  name="redemption_instructions"
                  value={formData.redemption_instructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Instructions for customers to redeem this offer"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-[rgb(var(--color-border))]">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Offer"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}