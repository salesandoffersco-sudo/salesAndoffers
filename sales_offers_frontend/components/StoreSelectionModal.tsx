"use client";

import { useState, useEffect } from "react";
import { FiX, FiSearch, FiExternalLink } from "react-icons/fi";
import Button from "./Button";
import { API_BASE_URL } from "../lib/api";

interface Store {
  id: number;
  store_name: string;
  store_url: string;
  price: number;
  is_available: boolean;
  store_info?: {
    name: string;
    logo: string;
    color: string;
  };
}

interface StoreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores?: Store[];
  dealTitle: string;
  mode?: 'view' | 'add';
  loading?: boolean;
  onAddStore?: (store: { name: string; url: string; price: number; logo?: string }) => void;
}

export default function StoreSelectionModal({ isOpen, onClose, stores = [], dealTitle, mode = 'view', loading = false, onAddStore }: StoreSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newStore, setNewStore] = useState({ name: '', url: '', price: 0, logo: '' });

  // Fallback stores if none provided
  const fallbackStores = [
    {
      id: 1,
      store_name: 'Jumia',
      store_url: 'https://jumia.co.ke',
      price: 15000,
      is_available: true,
      store_info: {
        name: 'Jumia',
        logo: 'https://logo.clearbit.com/jumia.com.ng',
        color: '#f68b1e'
      }
    },
    {
      id: 2,
      store_name: 'Kilimall',
      store_url: 'https://kilimall.co.ke',
      price: 14500,
      is_available: true,
      store_info: {
        name: 'Kilimall',
        logo: 'https://logo.clearbit.com/kilimall.co.ke',
        color: '#ff6b35'
      }
    },
    {
      id: 3,
      store_name: 'Amazon',
      store_url: 'https://amazon.com',
      price: 16200,
      is_available: true,
      store_info: {
        name: 'Amazon',
        logo: 'https://logo.clearbit.com/amazon.com',
        color: '#ff9900'
      }
    }
  ];

  // Debug logging
  console.log('StoreSelectionModal - stores:', stores);
  console.log('StoreSelectionModal - loading:', loading);
  
  const displayStores = stores.length > 0 ? stores : (loading ? [] : fallbackStores);
  
  const filteredStores = displayStores.filter(store =>
    store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    store.is_available
  );

  const handleStoreClick = async (store: Store) => {
    // Track the click
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/deals/track-click/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({ store_link_id: store.id })
        });
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
    
    window.open(store.store_url, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[rgb(var(--color-card))] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-[rgb(var(--color-border))]">
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compare Prices</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{dealTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-ui))] rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'add' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Store Name</label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Jumia, Amazon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Product URL</label>
                <input
                  type="url"
                  value={newStore.url}
                  onChange={(e) => setNewStore({...newStore, url: e.target.value})}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                  placeholder="https://store.com/product"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (KSh)</label>
                <input
                  type="number"
                  value={newStore.price}
                  onChange={(e) => setNewStore({...newStore, price: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Logo URL (Optional)</label>
                <input
                  type="url"
                  value={newStore.logo}
                  onChange={(e) => setNewStore({...newStore, logo: e.target.value})}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
                  placeholder="https://logo.clearbit.com/store.com"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  if (newStore.name && newStore.url && newStore.price && onAddStore) {
                    onAddStore(newStore);
                    setNewStore({ name: '', url: '', price: 0, logo: '' });
                    onClose();
                  }
                }}
                className="w-full"
              >
                Add Store
              </Button>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {mode === 'view' && (
            loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading stores...</p>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {stores.length === 0 ? "No stores available for this deal." : "No stores found matching your search."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreClick(store)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                        {store.store_info?.logo ? (
                          <img
                            src={store.store_info.logo}
                            alt={store.store_name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = store.store_name.charAt(0);
                            }}
                          />
                        ) : (
                          <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                            {store.store_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{store.store_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Available now</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          KSh {store.price.toLocaleString()}
                        </p>
                      </div>
                      <FiExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )
          )}


        </div>

        {mode === 'view' && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
              Prices are updated regularly. Click on a store to visit their website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}