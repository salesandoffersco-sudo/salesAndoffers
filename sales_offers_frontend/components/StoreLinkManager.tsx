"use client";

import { useState } from "react";
import { FiPlus, FiTrash2, FiExternalLink, FiCheck, FiX } from "react-icons/fi";

interface StoreLink {
  id?: number;
  store_name: string;
  store_url: string;
  price: number | null;
  coupon_code?: string;
  coupon_discount?: string;
  is_available: boolean;
}

interface StoreLinkManagerProps {
  storeLinks: StoreLink[];
  onChange: (storeLinks: StoreLink[]) => void;
  className?: string;
}

const POPULAR_STORES = [
  'Jumia',
  'Kilimall',
  'Amazon',
  'AliExpress',
  'eBay',
  'Shopify Store',
  'WooCommerce Store',
  'Other'
];

export default function StoreLinkManager({ storeLinks, onChange, className = "" }: StoreLinkManagerProps) {
  const [errors, setErrors] = useState<{[key: number]: string}>({});

  const addStoreLink = () => {
    const newStoreLink: StoreLink = {
      store_name: '',
      store_url: '',
      price: null,
      coupon_code: '',
      coupon_discount: '',
      is_available: true,
    };
    onChange([...storeLinks, newStoreLink]);
  };

  const removeStoreLink = (index: number) => {
    const updatedLinks = storeLinks.filter((_, i) => i !== index);
    onChange(updatedLinks);
    
    // Remove error for this index
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const updateStoreLink = (index: number, field: keyof StoreLink, value: any) => {
    const updatedLinks = [...storeLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    onChange(updatedLinks);

    // Clear error for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateStoreLink = (storeLink: StoreLink, index: number): string | null => {
    if (!storeLink.store_name.trim()) {
      return 'Store name is required';
    }
    
    if (!storeLink.store_url.trim()) {
      return 'Store URL is required';
    }
    
    if (!validateUrl(storeLink.store_url)) {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
    
    // Check for duplicate store names
    const duplicateIndex = storeLinks.findIndex((link, i) => 
      i !== index && link.store_name.toLowerCase() === storeLink.store_name.toLowerCase()
    );
    
    if (duplicateIndex !== -1) {
      return 'Store name already exists';
    }
    
    return null;
  };

  const handleBlur = (index: number) => {
    const storeLink = storeLinks[index];
    const error = validateStoreLink(storeLink, index);
    
    if (error) {
      setErrors({ ...errors, [index]: error });
    }
  };

  const testUrl = (url: string) => {
    if (validateUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))]">
            Store Links
          </h3>
          <p className="text-sm text-[rgb(var(--color-muted))] mt-1">
            Add links to stores where this product is available
          </p>
        </div>
        <button
          type="button"
          onClick={addStoreLink}
          className="inline-flex items-center px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Store
        </button>
      </div>

      {storeLinks.length === 0 ? (
        <div className="text-center py-8 bg-[rgb(var(--color-ui))] rounded-lg border-2 border-dashed border-[rgb(var(--color-border))]">
          <p className="text-[rgb(var(--color-muted))] mb-4">
            No store links added yet
          </p>
          <button
            type="button"
            onClick={addStoreLink}
            className="inline-flex items-center px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Your First Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {storeLinks.map((storeLink, index) => (
            <div
              key={index}
              className={`bg-[rgb(var(--color-card))] border rounded-lg p-4 ${
                errors[index] ? 'border-red-300 dark:border-red-600' : 'border-[rgb(var(--color-border))]'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-[rgb(var(--color-fg))]">
                  Store #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeStoreLink(index)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded transition-colors"
                  title="Remove store"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Store Name *
                  </label>
                  <select
                    value={storeLink.store_name}
                    onChange={(e) => updateStoreLink(index, 'store_name', e.target.value)}
                    onBlur={() => handleBlur(index)}
                    className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                  >
                    <option value="">Select a store</option>
                    {POPULAR_STORES.map((store) => (
                      <option key={store} value={store}>
                        {store}
                      </option>
                    ))}
                  </select>
                  {storeLink.store_name === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom store name"
                      value={storeLink.store_name === 'Other' ? '' : storeLink.store_name}
                      onChange={(e) => updateStoreLink(index, 'store_name', e.target.value)}
                      onBlur={() => handleBlur(index)}
                      className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] mt-2"
                    />
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Price (KSh)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 2500"
                    value={storeLink.price || ''}
                    onChange={(e) => updateStoreLink(index, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                  />
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                    Optional - helps users compare prices
                  </p>
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SAVE20, JUMIA15"
                    value={storeLink.coupon_code || ''}
                    onChange={(e) => updateStoreLink(index, 'coupon_code', e.target.value)}
                    className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                  />
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                    Optional - discount code for this store
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Coupon Discount */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Coupon Discount
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 20%, KSh 500"
                    value={storeLink.coupon_discount || ''}
                    onChange={(e) => updateStoreLink(index, 'coupon_discount', e.target.value)}
                    className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                  />
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                    Optional - discount amount/percentage
                  </p>
                </div>
              </div>

              {/* Store URL */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Store URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://store.com/product-link"
                    value={storeLink.store_url}
                    onChange={(e) => updateStoreLink(index, 'store_url', e.target.value)}
                    onBlur={() => handleBlur(index)}
                    className="flex-1 px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                  />
                  {storeLink.store_url && validateUrl(storeLink.store_url) && (
                    <button
                      type="button"
                      onClick={() => testUrl(storeLink.store_url)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-[rgb(var(--color-muted))] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Test URL"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))]">
                    Availability
                  </label>
                  <p className="text-xs text-[rgb(var(--color-muted))]">
                    Is this product currently available at this store?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateStoreLink(index, 'is_available', !storeLink.is_available)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    storeLink.is_available
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {storeLink.is_available ? (
                    <>
                      <FiCheck className="w-4 h-4 mr-2" />
                      Available
                    </>
                  ) : (
                    <>
                      <FiX className="w-4 h-4 mr-2" />
                      Unavailable
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {errors[index] && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors[index]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {storeLinks.length > 0 && (
        <div className="bg-[rgb(var(--color-ui))] rounded-lg p-4">
          <h4 className="font-medium text-[rgb(var(--color-fg))] mb-2">
            Tips for Better Results:
          </h4>
          <ul className="text-sm text-[rgb(var(--color-muted))] space-y-1">
            <li>• Use direct product links, not homepage URLs</li>
            <li>• Include prices to help users compare deals</li>
            <li>• Update availability status regularly</li>
            <li>• Test your links to ensure they work correctly</li>
          </ul>
        </div>
      )}
    </div>
  );
}