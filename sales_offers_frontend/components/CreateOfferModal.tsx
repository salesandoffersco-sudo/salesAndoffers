"use client";

import { useState, useEffect } from "react";
import React from "react";
import { FiX, FiCalendar } from "react-icons/fi";
import Button from "./Button";
import DealImageUpload from "./DealImageUpload";
import StoreLinkManager from "./StoreLinkManager";
import PhysicalStoreManager from "./PhysicalStoreManager";
import { api } from "../lib/api";

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOfferModal({ isOpen, onClose, onSuccess }: CreateOfferModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    original_price: "",
    discounted_price: "",
    discount_percentage: 0,
    expires_at: "",
    category: "Other",
    max_vouchers: 100,
  });
  const [images, setImages] = useState<any[]>([]);
  const [storeLinks, setStoreLinks] = useState<any[]>([]);
  const [physicalStores, setPhysicalStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | { message: string, actionRequired: boolean, redirectUrl: string }>("");
  const [subscription, setSubscription] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate discount percentage
      if (name === "original_price" || name === "discounted_price") {
        const original = parseFloat(name === "original_price" ? value : prev.original_price) || 0;
        const discounted = parseFloat(name === "discounted_price" ? value : prev.discounted_price) || 0;

        if (original > 0 && discounted > 0) {
          updated.discount_percentage = Math.round(((original - discounted) / original) * 100);
        }
      }

      return updated;
    });
  };

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/api/sellers/stats/');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const dealData = {
        ...formData,
        main_image: images.find(img => img.is_main)?.image_url || images[0]?.image_url || null
      };

      const response = await api.post('/api/deals/', dealData);
      const dealId = response.data.id;

      // Upload images to the created deal
      if (images.length > 0) {
        for (const image of images) {
          await api.post(`/api/deals/${dealId}/images/`, {
            image_url: image.image_url,
            is_main: image.is_main,
            alt_text: image.alt_text
          });
        }
      }

      // Create store links for the deal
      if (storeLinks.length > 0) {
        for (const store of storeLinks) {
          await api.post(`/api/deals/${dealId}/store-links/`, {
            store_name: store.store_name,
            store_url: store.store_url,
            price: store.price,
            coupon_code: store.coupon_code,
            coupon_discount: store.coupon_discount,
            is_available: store.is_available
          });
        }
      }

      // Create physical stores for the deal
      if (physicalStores.length > 0) {
        for (const store of physicalStores) {
          const storeResponse = await api.post(`/api/deals/${dealId}/physical-stores/`, {
            store_name: store.store_name,
            address: store.address,
            phone_number: store.phone_number,
            opening_hours: store.opening_hours,
            map_url: store.map_url
          });

          const storeId = storeResponse.data.id;

          // Upload images for this store
          if (store.imageFiles && store.imageFiles.length > 0) {
            for (const file of store.imageFiles) {
              try {
                // Upload file to get URL
                const filename = `stores/${dealId}/${storeId}/${Date.now()}-${file.name}`;
                const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                  method: 'POST',
                  body: file,
                });

                if (uploadResponse.ok) {
                  const result = await uploadResponse.json();
                  const imageUrl = result.url;

                  // Link image to physical store
                  await api.post(`/api/deals/${dealId}/physical-stores/${storeId}/images/`, {
                    image_url: imageUrl
                  });
                }
              } catch (imgError) {
                console.error("Error uploading store image:", imgError);
                // Continue with other images even if one fails
              }
            }
          }
        }
      }

      onSuccess();
      onClose();
      setFormData({
        title: "",
        description: "",
        original_price: "",
        discounted_price: "",
        discount_percentage: 0,
        expires_at: "",
        category: "Other",
        max_vouchers: 100,
      });
      setImages([]);
      setStoreLinks([]);
      setPhysicalStores([]);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.action_required === 'setup_profile') {
        setError({
          message: errorData.error,
          actionRequired: true,
          redirectUrl: errorData.redirect_url
        });
      } else {
        setError(errorData?.detail || errorData?.error || "Failed to create offer");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchSubscription();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Offer</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {subscription && !subscription.can_create_offers && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Plan Limit Reached:</span>
                <span>You've used {subscription.max_offers === -1 ? 'unlimited' : subscription.max_offers} offers. </span>
                <a href="/pricing" className="underline font-medium">Upgrade now</a>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {typeof error === 'string' ? (
                error
              ) : (
                <div className="space-y-3">
                  <p>{error.message}</p>
                  {error.actionRequired && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.href = error.redirectUrl}
                    >
                      Setup Seller Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Offer Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter offer title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Describe your offer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original Price (KES)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sale Price (KES)
              </label>
              <input
                type="number"
                name="discounted_price"
                value={formData.discounted_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount %
              </label>
              <input
                type="number"
                value={formData.discount_percentage}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Food">Food & Beverages</option>
              <option value="Home">Home & Garden</option>
              <option value="Services">Services</option>
              <option value="Coupons">Coupons & Deals</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Deal Images ({images.length}/5)
            </label>
            <DealImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
            <StoreLinkManager
              storeLinks={storeLinks}
              onChange={setStoreLinks}
            />
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
            <StoreLinkManager
              storeLinks={storeLinks}
              onChange={setStoreLinks}
            />
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
            <PhysicalStoreManager
              stores={physicalStores}
              onChange={setPhysicalStores}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expires At
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Offer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}