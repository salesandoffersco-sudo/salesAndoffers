"use client";

import { useState, useRef } from "react";
import { FiX, FiUpload, FiTag, FiFile, FiImage, FiVideo, FiMusic } from "react-icons/fi";
import Button from "./Button";

interface Offer {
  id: number;
  title: string;
  discounted_price: string;
  main_image?: string;
  discount_percentage: number;
}

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendFile: (file: File) => void;
  onSendOffer: (offer: Offer) => void;
}

export default function AttachmentModal({
  isOpen,
  onClose,
  onSendFile,
  onSendOffer
}: AttachmentModalProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'offer'>('file');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      onClose();
    }
  };

  const loadOffers = async () => {
    if (offers.length > 0) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/my-deals/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data.results || data);
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'file' | 'offer') => {
    setActiveTab(tab);
    if (tab === 'offer') {
      loadOffers();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[rgb(var(--color-card))] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Send Attachment</h3>
          <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg">
            <FiX className="w-5 h-5 text-[rgb(var(--color-muted))]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgb(var(--color-border))]">
          <button
            onClick={() => handleTabChange('file')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'file'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]'
            }`}
          >
            <FiFile className="w-4 h-4 inline mr-2" />
            File
          </button>
          <button
            onClick={() => handleTabChange('offer')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'offer'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]'
            }`}
          >
            <FiTag className="w-4 h-4 inline mr-2" />
            My Offers
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'file' ? (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="*/*"
              />
              <div className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-xl p-8">
                <FiUpload className="w-12 h-12 text-[rgb(var(--color-muted))] mx-auto mb-4" />
                <h4 className="text-lg font-medium text-[rgb(var(--color-text))] mb-2">
                  Choose a file to send
                </h4>
                <p className="text-sm text-[rgb(var(--color-muted))] mb-2">
                  Images, videos, documents, and more
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mb-4 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  ⏰ Files will be automatically deleted after 24 hours
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  className="mx-auto"
                >
                  Select File
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-sm text-[rgb(var(--color-muted))] mt-2">Loading offers...</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-8">
                  <FiTag className="w-12 h-12 text-[rgb(var(--color-muted))] mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-muted))]">No offers available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      onClick={() => {
                        onSendOffer(offer);
                        onClose();
                      }}
                      className="flex items-center space-x-3 p-3 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-bg))] cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {offer.main_image ? (
                          <img src={offer.main_image} alt={offer.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiTag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[rgb(var(--color-text))] truncate">{offer.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-600 font-semibold">KES {offer.discounted_price}</span>
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            {offer.discount_percentage}% OFF
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}