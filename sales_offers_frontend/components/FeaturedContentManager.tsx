"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { FiStar, FiX, FiPlus, FiTrendingUp, FiEye, FiHeart, FiAward, FiSearch } from "react-icons/fi";

interface FeaturedContentManagerProps {
  onClose: () => void;
}

export default function FeaturedContentManager({ onClose }: FeaturedContentManagerProps) {
  const [activeTab, setActiveTab] = useState<'deals' | 'sellers'>('deals');
  const [featuredDeals, setFeaturedDeals] = useState<any[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<any[]>([]);
  const [allDeals, setAllDeals] = useState<any[]>([]);
  const [allSellers, setAllSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredDealsRes, featuredSellersRes, allDealsRes, allSellersRes] = await Promise.all([
        api.get('/api/deals/admin/featured-deals/'),
        api.get('/api/deals/admin/featured-sellers/'),
        api.get('/api/deals/admin/'),
        api.get('/api/sellers/admin/sellers/')
      ]);
      
      setFeaturedDeals(featuredDealsRes.data);
      setFeaturedSellers(featuredSellersRes.data);
      setAllDeals(allDealsRes.data);
      setAllSellers(allSellersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const removeFeatured = async (contentType: string, objectId: number) => {
    try {
      await api.delete(`/api/deals/admin/featured/${contentType}/${objectId}/`);
      fetchData();
    } catch (error) {
      console.error('Error removing featured:', error);
    }
  };

  const addFeatured = async (contentType: string, objectId: number, priority: number, algorithm: string) => {
    try {
      const endpoint = contentType === 'deal' ? '/api/deals/admin/set-featured-deal/' : '/api/deals/admin/set-featured-seller/';
      await api.post(endpoint, {
        [`${contentType}_id`]: objectId,
        priority,
        algorithm,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });
      fetchData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding featured:', error);
    }
  };

  const getAlgorithmIcon = (algorithm: string) => {
    switch (algorithm) {
      case 'likes': return <FiHeart className="w-4 h-4" />;
      case 'views': return <FiEye className="w-4 h-4" />;
      case 'clicks': return <FiTrendingUp className="w-4 h-4" />;
      case 'subscription': return <FiAward className="w-4 h-4" />;
      default: return <FiStar className="w-4 h-4" />;
    }
  };

  const getAlgorithmColor = (algorithm: string) => {
    switch (algorithm) {
      case 'likes': return 'text-red-500';
      case 'views': return 'text-blue-500';
      case 'clicks': return 'text-green-500';
      case 'subscription': return 'text-purple-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[rgb(var(--color-card))] rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-bold text-[rgb(var(--color-fg))]">Featured Content Manager</h2>
          <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--color-ui))] rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[rgb(var(--color-border))]">
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-6 py-3 font-medium ${activeTab === 'deals' 
              ? 'text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]' 
              : 'text-[rgb(var(--color-muted))]'}`}
          >
            Featured Deals ({featuredDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-6 py-3 font-medium ${activeTab === 'sellers' 
              ? 'text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]' 
              : 'text-[rgb(var(--color-muted))]'}`}
          >
            Featured Sellers ({featuredSellers.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[rgb(var(--color-muted))] text-sm">
              Manage featured content with automatic fallback algorithms
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[rgb(var(--color-primary))] text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Featured</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary))] mx-auto mb-4"></div>
              <p className="text-[rgb(var(--color-muted))]">Loading featured content...</p>
            </div>
          ) : (activeTab === 'deals' ? featuredDeals : featuredSellers).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[rgb(var(--color-ui))] rounded-full mx-auto mb-4 flex items-center justify-center">
                {activeTab === 'deals' ? (
                  <FiStar className="w-8 h-8 text-[rgb(var(--color-muted))]" />
                ) : (
                  <FiAward className="w-8 h-8 text-[rgb(var(--color-muted))]" />
                )}
              </div>
              <h3 className="text-lg font-medium text-[rgb(var(--color-fg))] mb-2">
                No Featured {activeTab === 'deals' ? 'Deals' : 'Sellers'}
              </h3>
              <p className="text-[rgb(var(--color-muted))] mb-4">
                Start by adding some {activeTab === 'deals' ? 'deals' : 'sellers'} to the featured list.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[rgb(var(--color-primary))] text-white px-4 py-2 rounded-lg hover:opacity-90"
              >
                Add First Featured {activeTab === 'deals' ? 'Deal' : 'Seller'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'deals' ? featuredDeals : featuredSellers).map((item) => (
                <div key={item.id} className="bg-[rgb(var(--color-ui))] rounded-lg p-4 border border-[rgb(var(--color-border))]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getAlgorithmColor(item.featured_algorithm)}`}>
                        {getAlgorithmIcon(item.featured_algorithm)}
                      </div>
                      <span className="text-xs font-medium text-[rgb(var(--color-muted))] capitalize">
                        {item.featured_algorithm}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFeatured(activeTab === 'deals' ? 'deal' : 'seller', item.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="relative">
                      {item.main_image ? (
                        <img src={item.main_image} alt="" className="w-full h-32 object-cover rounded mb-2" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded mb-2 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-2 flex items-center justify-center">
                              {activeTab === 'deals' ? (
                                <FiStar className="w-4 h-4 text-white" />
                              ) : (
                                <FiAward className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="text-xs text-[rgb(var(--color-muted))]">No Image</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        #{item.id}
                      </div>
                    </div>
                    <h3 className="font-medium text-[rgb(var(--color-fg))] line-clamp-2 mb-1">
                      {activeTab === 'deals' ? item.title : item.business_name}
                    </h3>
                    {activeTab === 'deals' ? (
                      <div className="space-y-1">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">{item.price_range}</p>
                        <p className="text-xs text-[rgb(var(--color-muted))]">{item.seller?.business_name || 'Unknown Seller'}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-[rgb(var(--color-muted))]">{item.address}</p>
                        <div className="flex items-center space-x-1">
                          <FiStar className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-[rgb(var(--color-muted))]">{item.rating || '4.5'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-[rgb(var(--color-muted))]">
                    <span>Priority: {item.featured_priority}</span>
                    <span>Expires: {new Date(item.featured_expires).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Featured Modal */}
        {showAddModal && (
          <AddFeaturedModal
            contentType={activeTab}
            items={activeTab === 'deals' ? allDeals : allSellers}
            onAdd={addFeatured}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  );
}

interface AddFeaturedModalProps {
  contentType: 'deals' | 'sellers';
  items: any[];
  onAdd: (contentType: string, objectId: number, priority: number, algorithm: string) => void;
  onClose: () => void;
}

function AddFeaturedModal({ contentType, items, onAdd, onClose }: AddFeaturedModalProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [priority, setPriority] = useState(1);
  const [algorithm, setAlgorithm] = useState('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter(item => {
    const searchText = contentType === 'deals' ? item.title : item.business_name;
    return searchText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedItemData = items.find(item => item.id === selectedItem);

  const handleSubmit = () => {
    if (selectedItem) {
      onAdd(contentType.slice(0, -1), selectedItem, priority, algorithm);
    }
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item.id);
    setSearchTerm(contentType === 'deals' ? item.title : item.business_name);
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
      <div className="bg-[rgb(var(--color-card))] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <h3 className="text-lg font-bold text-[rgb(var(--color-fg))]">Add Featured {contentType.slice(0, -1)}</h3>
          <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--color-ui))] rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
              Search & Select {contentType.slice(0, -1)}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setSelectedItem(null);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={`Search ${contentType.slice(0, -1)}s...`}
                className="w-full p-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))] pr-10"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))] w-4 h-4" />
            </div>
            
            {showDropdown && filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredItems.slice(0, 50).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="flex items-center p-3 hover:bg-[rgb(var(--color-ui))] cursor-pointer border-b border-[rgb(var(--color-border))] last:border-b-0"
                  >
                    {item.main_image && (
                      <img 
                        src={item.main_image} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[rgb(var(--color-fg))] truncate">
                        {contentType === 'deals' ? item.title : item.business_name}
                      </h4>
                      {contentType === 'deals' ? (
                        <p className="text-sm text-[rgb(var(--color-muted))] truncate">
                          {item.price_range} • {item.seller?.business_name || 'Unknown Seller'}
                        </p>
                      ) : (
                        <p className="text-sm text-[rgb(var(--color-muted))] truncate">
                          {item.address} • Rating: {item.rating || '4.5'}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-[rgb(var(--color-muted))] ml-2">
                      ID: {item.id}
                    </div>
                  </div>
                ))}
                {filteredItems.length > 50 && (
                  <div className="p-3 text-center text-sm text-[rgb(var(--color-muted))] bg-[rgb(var(--color-ui))]">
                    Showing first 50 results. Refine your search for more specific results.
                  </div>
                )}
              </div>
            )}
            
            {selectedItemData && (
              <div className="mt-3 p-3 bg-[rgb(var(--color-ui))] rounded-lg border border-[rgb(var(--color-border))]">
                <div className="flex items-center space-x-3">
                  {selectedItemData.main_image && (
                    <img 
                      src={selectedItemData.main_image} 
                      alt="" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-[rgb(var(--color-fg))]">
                      {contentType === 'deals' ? selectedItemData.title : selectedItemData.business_name}
                    </h4>
                    <p className="text-sm text-[rgb(var(--color-muted))] mt-1">
                      {contentType === 'deals' 
                        ? `${selectedItemData.price_range} • ${selectedItemData.seller?.business_name || 'Unknown Seller'}`
                        : `${selectedItemData.address} • Rating: ${selectedItemData.rating || '4.5'}`
                      }
                    </p>
                    <p className="text-xs text-[rgb(var(--color-muted))] mt-1">ID: {selectedItemData.id}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      setSearchTerm('');
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Priority</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              min="1"
              max="10"
              className="w-full p-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))]"
            >
              <option value="manual">Manual Selection</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
              <option value="clicks">Most Clicked</option>
              <option value="subscription">Premium Subscription</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!selectedItem}
              className="flex-1 bg-[rgb(var(--color-primary))] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Add Featured
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[rgb(var(--color-ui))] text-[rgb(var(--color-fg))] py-3 rounded-lg hover:bg-[rgb(var(--color-border))]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}