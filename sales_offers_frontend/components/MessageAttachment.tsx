"use client";

import { useState } from "react";
import { FiDownload, FiEye, FiFile, FiImage, FiVideo, FiMusic, FiFileText, FiTag, FiX } from "react-icons/fi";
import Button from "./Button";

interface MessageAttachmentProps {
  attachment: {
    type: 'file' | 'offer';
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
    expired?: boolean;
    message?: string;
    offer?: {
      id: number;
      title: string;
      discounted_price: string;
      main_image?: string;
      discount_percentage: number;
    };
  };
}

export default function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const [showPreview, setShowPreview] = useState(false);
  
  // Handle expired attachments
  if (attachment.expired) {
    return (
      <div className="max-w-xs bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-xl p-4">
        <div className="text-center">
          <FiFile className="w-12 h-12 text-[rgb(var(--color-muted))] mx-auto mb-2" />
          <h4 className="font-medium text-[rgb(var(--color-text))] mb-2">
            File Expired
          </h4>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            This file has expired and is no longer available
          </p>
        </div>
      </div>
    );
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return FiFile;
    
    if (mimeType.startsWith('image/')) return FiImage;
    if (mimeType.startsWith('video/')) return FiVideo;
    if (mimeType.startsWith('audio/')) return FiMusic;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FiFileText;
    return FiFile;
  };

  const isPreviewable = (mimeType?: string) => {
    if (!mimeType) return false;
    return mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType.startsWith('audio/');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    if (attachment.type === 'offer' && attachment.offer) {
      window.open(`/offers/${attachment.offer.id}`, '_blank');
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  if (attachment.type === 'offer' && attachment.offer) {
    return (
      <div className="max-w-xs bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-xl overflow-hidden">
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-2">
            <FiTag className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">OFFER SHARED</span>
          </div>
          
          {attachment.offer.main_image && (
            <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
              <img 
                src={attachment.offer.main_image} 
                alt={attachment.offer.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h4 className="font-medium text-[rgb(var(--color-text))] mb-2 line-clamp-2">
            {attachment.offer.title}
          </h4>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-purple-600">
              KES {attachment.offer.discounted_price}
            </span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
              {attachment.offer.discount_percentage}% OFF
            </span>
          </div>
          
          <Button
            onClick={handleView}
            variant="primary"
            size="sm"
            className="w-full"
          >
            View Offer
          </Button>
        </div>
      </div>
    );
  }

  const FileIcon = getFileIcon(attachment.mimeType);
  const canPreview = isPreviewable(attachment.mimeType);

  return (
    <>
      <div className="max-w-xs bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-xl overflow-hidden">
        {canPreview && attachment.mimeType?.startsWith('image/') ? (
          <div className="w-full h-48 bg-gray-200 overflow-hidden">
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowPreview(true)}
            />
          </div>
        ) : canPreview && attachment.mimeType?.startsWith('video/') ? (
          <div className="w-full h-48 bg-gray-200">
            <video 
              src={attachment.url}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          </div>
        ) : canPreview && attachment.mimeType?.startsWith('audio/') ? (
          <div className="p-4">
            <audio 
              src={attachment.url}
              className="w-full"
              controls
              preload="metadata"
            />
          </div>
        ) : (
          <div className="p-4 text-center">
            <FileIcon className="w-12 h-12 text-[rgb(var(--color-muted))] mx-auto mb-2" />
          </div>
        )}
        
        <div className="p-3">
          <h4 className="font-medium text-[rgb(var(--color-text))] mb-1 truncate">
            {attachment.name}
          </h4>
          {attachment.size && (
            <p className="text-xs text-[rgb(var(--color-muted))] mb-3">
              {formatFileSize(attachment.size)}
            </p>
          )}
          
          <div className="flex space-x-2">
            <Button
              onClick={handleView}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <FiEye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              onClick={handleDownload}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              <FiDownload className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && attachment.mimeType?.startsWith('image/') && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-10"
            >
              <FiX className="w-6 h-6" />
            </button>
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}