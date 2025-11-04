"use client";

import { useState } from "react";
import { FiExternalLink, FiStar, FiCheck, FiX, FiTrendingDown } from "react-icons/fi";

interface StoreLink {
  id: number;
  store_name: string;
  store_url: string;
  price: number | null;
  is_available: boolean;
  click_count?: number;
}

interface StoreComparisonTableProps {
  storeLinks: StoreLink[];
  dealTitle: string;
}

export default function StoreComparisonTable({ storeLinks, dealTitle }: StoreComparisonTableProps) {
  const [sortBy, setSortBy] = useState<'price' | 'store' | 'popularity'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter available stores and sort
  const availableStores = storeLinks.filter(store => store.is_available);
  const unavailableStores = storeLinks.filter(store => !store.is_available);

  const sortedStores = [...availableStores].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        const priceA = a.price || Infinity;
        const priceB = b.price || Infinity;
        comparison = priceA - priceB;
        break;
      case 'store':
        comparison = a.store_name.localeCompare(b.store_name);
        break;
      case 'popularity':
        comparison = (b.click_count || 0) - (a.click_count || 0);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const lowestPrice = availableStores
    .filter(store => store.price)
    .reduce((min, store) => Math.min(min, store.price!), Infinity);

  const handleSort = (column: 'price' | 'store' | 'popularity') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleStoreClick = async (storeLink: StoreLink) => {
    // Track click
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:8000/api/deals/track-click/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            store_link_id: storeLink.id,
          }),
        });
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open store in new tab
    window.open(storeLink.store_url, '_blank', 'noopener,noreferrer');
  };

  if (storeLinks.length === 0) {
    return (
      <div className="bg-[rgb(var(--color-card))] rounded-lg p-8 text-center border border-[rgb(var(--color-border))]">
        <p className="text-[rgb(var(--color-muted))]">No store links available for this deal.</p>
      </div>
    );
  }

  return (
    <div className="bg-[rgb(var(--color-card))] rounded-lg border border-[rgb(var(--color-border))] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--color-border))]">
        <h3 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
          Compare Prices Across Stores
        </h3>
        <p className="text-[rgb(var(--color-muted))] text-sm">
          Find the best deal for "{dealTitle}" from trusted online stores
        </p>
      </div>

      {/* Available Stores */}
      {availableStores.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgb(var(--color-ui))]">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider cursor-pointer hover:text-[rgb(var(--color-fg))] transition-colors"
                  onClick={() => handleSort('store')}
                >
                  Store {sortBy === 'store' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider cursor-pointer hover:text-[rgb(var(--color-fg))] transition-colors"
                  onClick={() => handleSort('price')}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {sortedStores.map((store) => {
                const isBestDeal = store.price === lowestPrice && store.price !== null;
                
                return (
                  <tr 
                    key={store.id} 
                    className={`hover:bg-[rgb(var(--color-ui))] transition-colors ${
                      isBestDeal ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-[rgb(var(--color-fg))]">
                          {store.store_name}
                        </div>
                        {isBestDeal && (
                          <div className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <FiTrendingDown className="w-3 h-3 mr-1" />
                            Best Deal
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {store.price ? (
                        <div className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                          KSh {store.price.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-sm text-[rgb(var(--color-muted))]">
                          Price not available
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Available
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleStoreClick(store)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isBestDeal
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                            : 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] hover:shadow-lg'
                        }`}
                      >
                        <FiExternalLink className="w-4 h-4 mr-2" />
                        {isBestDeal ? 'Get Best Deal' : 'Shop Now'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Unavailable Stores */}
      {unavailableStores.length > 0 && (
        <div className="border-t border-[rgb(var(--color-border))]">
          <div className="p-4 bg-[rgb(var(--color-ui))]">
            <h4 className="text-sm font-medium text-[rgb(var(--color-muted))] mb-3">
              Currently Unavailable
            </h4>
            <div className="space-y-2">
              {unavailableStores.map((store) => (
                <div key={store.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <FiX className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-[rgb(var(--color-muted))]">
                      {store.store_name}
                    </span>
                  </div>
                  <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                    Out of Stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {availableStores.length > 0 && (
        <div className="p-4 bg-[rgb(var(--color-ui))] border-t border-[rgb(var(--color-border))]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgb(var(--color-muted))]">
              Available in {availableStores.length} store{availableStores.length !== 1 ? 's' : ''}
            </span>
            {lowestPrice !== Infinity && (
              <span className="font-medium text-green-600 dark:text-green-400">
                Best price: KSh {lowestPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}