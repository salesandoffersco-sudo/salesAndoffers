"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiBarChart, FiToggleLeft, FiToggleRight, FiSearch, FiFilter } from "react-icons/fi";
import Button from "../../../components/Button";
import CreateOfferModal from "../../../components/CreateOfferModal";
import EditOfferModal from "../../../components/EditOfferModal";
import { api } from "../../../lib/api";

interface Offer {
  id: number;
  title: string;
  description: string;
  best_price?: string;
  category: string;
  image?: string;
  main_image?: string;
  is_published: boolean;
  status: string;
  created_at: string;
  expires_at: string;
  store_count?: number;
  click_count?: number;
}

export default function SellerOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await api.get('/api/sellers/offers/');
      setOffers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setLoading(false);
    }
  };

  const toggleOfferStatus = async (offerId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/api/deals/${offerId}/`, {
        is_published: !currentStatus
      });
      setOffers(offers.map(offer => 
        offer.id === offerId 
          ? { ...offer, is_published: !currentStatus }
          : offer
      ));
    } catch (error) {
      console.error("Error toggling offer status:", error);
    }
  };

  const deleteOffer = async (offerId: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    
    try {
      await api.delete(`/api/deals/${offerId}/`);
      setOffers(offers.filter(offer => offer.id !== offerId));
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && offer.is_published) ||
      (statusFilter === "inactive" && !offer.is_published);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text))]">My Offers</h1>
            <p className="text-[rgb(var(--color-muted))] mt-2">Manage all your listings and deals</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <FiPlus className="w-4 h-4 mr-2" />
            Create New Offer
          </Button>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 mb-6 border border-[rgb(var(--color-border))]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="text-[rgb(var(--color-muted))]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20">
            <FiEye className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">No offers found</h3>
            <p className="text-[rgb(var(--color-muted))] mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Create your first offer to get started"}
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-[rgb(var(--color-card))] rounded-xl p-4 sm:p-6 border border-[rgb(var(--color-border))] hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3">
                      {(offer.main_image || offer.image) && (
                        <img 
                          src={offer.main_image || offer.image} 
                          alt={offer.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-[rgb(var(--color-text))] truncate">{offer.title}</h3>
                        <p className="text-[rgb(var(--color-muted))] text-sm mt-1">{offer.category}</p>
                      </div>
                    </div>
                    
                    <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-2 text-sm sm:text-base">{offer.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        {offer.best_price && (
                          <>
                            <span className="text-[rgb(var(--color-muted))]">Best Price:</span>
                            <span className="font-semibold text-purple-600">KSh {offer.best_price}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[rgb(var(--color-muted))]">Stores:</span>
                          <span className="font-semibold">{offer.store_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[rgb(var(--color-muted))]">Clicks:</span>
                          <span className="font-semibold">{offer.click_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-3 lg:ml-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      offer.is_published 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {offer.is_published ? 'Published' : 'Draft'}
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => toggleOfferStatus(offer.id, offer.is_published)}
                        className="p-2 hover:bg-[rgb(var(--color-ui))] rounded-lg transition-colors flex-shrink-0"
                        title={offer.is_published ? 'Unpublish offer' : 'Publish offer'}
                      >
                        {offer.is_published ? (
                          <FiToggleRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        ) : (
                          <FiToggleLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        )}
                      </button>
                      
                      <Link href={`/seller/analytics/deal/${offer.id}`}>
                        <Button variant="outline" size="sm" title="View Analytics" className="min-w-0 px-2 sm:px-4">
                          <FiBarChart className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/offers/${offer.id}`}>
                        <Button variant="outline" size="sm" title="View Advertisement" className="min-w-0 px-2 sm:px-4">
                          <FiEye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditingOfferId(offer.id);
                          setShowEditModal(true);
                        }}
                        title="Edit Advertisement"
                        className="min-w-0 px-2 sm:px-4"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteOffer(offer.id)}
                        title="Delete Advertisement"
                        className="text-red-500 hover:text-red-700 min-w-0 px-2 sm:px-4"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateOfferModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchOffers();
          setShowCreateModal(false);
        }}
      />
      
      {editingOfferId && (
        <EditOfferModal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingOfferId(null);
          }}
          onSuccess={() => {
            fetchOffers();
            setShowEditModal(false);
            setEditingOfferId(null);
          }}
          offerId={editingOfferId}
        />
      )}
    </div>
  );
}