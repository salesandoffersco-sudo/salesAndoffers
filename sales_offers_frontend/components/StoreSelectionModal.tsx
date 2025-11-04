"use client";

import { useState, useEffect } from "react";
import { FiX, FiSearch, FiExternalLink } from "react-icons/fi";
import Button from "./Button";
import { API_BASE_URL } from "../lib/api";

interface Store {
  name: string;
  logo_url: string;
  color: string;
  website: string;
}

interface StoreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (storeKey: string, storeInfo: Store) => void;
}

export default function StoreSelectionModal({ isOpen, onClose, onSelect }: StoreSelectionModalProps) {
  const [stores, setStores] = useState<Record<string, Store>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchStores();
    }
  }, [isOpen]);

  const fetchStores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deals/stores/`);
      const data = await response.json();
      setStores(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stores:", error);
      // Fallback to hardcoded stores
      setStores({
        jumia: {
          name: 'Jumia',
          logo_url: 'https://logo.clearbit.com/jumia.co.ke',
          color: '#f68b1e',
          website: 'https://jumia.co.ke'
        },
        kilimall: {
          name: 'Kilimall',
          logo_url: 'https://logo.clearbit.com/kilimall.co.ke',
          color: '#e74c3c',
          website: 'https://kilimall.co.ke'
        },
        amazon: {
          name: 'Amazon',
          logo_url: 'https://logo.clearbit.com/amazon.com',
          color: '#ff9900',
          website: 'https://amazon.com'
        },
        aliexpress: {
          name: 'AliExpress',
          logo_url: 'https://logo.clearbit.com/aliexpress.com',
          color: '#ff6a00',
          website: 'https://aliexpress.com'
        },
        ebay: {
          name: 'eBay',
          logo_url: 'https://logo.clearbit.com/ebay.com',
          color: '#0064d2',
          website: 'https://ebay.com'
        }
      });
      setLoading(false);
    }
  };

  const filteredStores = Object.entries(stores).filter(([key, store]) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[rgb(var(--color-card))] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-[rgb(var(--color-border))]">
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Select Store</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-ui))] rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
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

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-[rgb(var(--color-muted))]">Loading stores...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredStores.map(([key, store]) => (
                <button
                  key={key}
                  onClick={() => onSelect(key, store)}
                  className="flex items-center gap-4 p-4 border border-[rgb(var(--color-border))] rounded-lg hover:border-purple-500 hover:bg-[rgb(var(--color-ui))] transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border">
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/48x48/6366f1/ffffff?text=Store';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[rgb(var(--color-text))]">{store.name}</h3>
                    <p className="text-sm text-[rgb(var(--color-muted))]">
                      {store.website !== '#' ? store.website : 'Custom store'}
                    </p>
                  </div>
                  <FiExternalLink className="w-4 h-4 text-[rgb(var(--color-muted))]" />
                </button>
              ))}
            </div>
          )}

          {!loading && filteredStores.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[rgb(var(--color-muted))]">No stores found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[rgb(var(--color-border))]">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}