"use client";

import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

interface DealImage {
  id: number;
  image_url: string;
  is_main: boolean;
  order: number;
  alt_text?: string;
}

interface DealImageGalleryProps {
  images: DealImage[];
  mainImage?: string;
  title: string;
  className?: string;
}

export default function DealImageGallery({ 
  images, 
  mainImage, 
  title, 
  className = '' 
}: DealImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine main image with gallery images, ensuring main image is first
  const allImages = React.useMemo(() => {
    const sortedImages = [...images].sort((a, b) => {
      if (a.is_main && !b.is_main) return -1;
      if (!a.is_main && b.is_main) return 1;
      return a.order - b.order;
    });

    // If there's a main_image URL that's not in the images array, add it
    if (mainImage && !sortedImages.some(img => img.image_url === mainImage)) {
      sortedImages.unshift({
        id: -1,
        image_url: mainImage,
        is_main: true,
        order: -1,
        alt_text: title
      });
    }

    return sortedImages;
  }, [images, mainImage, title]);

  const currentImage = allImages[selectedIndex];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (allImages.length === 0) {
    return (
      <div className={`aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📷</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4">
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text || title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />
        
        {/* Navigation arrows for multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
        
        {/* Main image badge */}
        {currentImage.is_main && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Main
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
              }`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `${title} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || title}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
            
            {/* Navigation in modal */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
                
                {/* Image counter in modal */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm">
                  {selectedIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}