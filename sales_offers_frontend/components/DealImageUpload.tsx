"use client";

// Deal image upload component with Vercel Blob integration
import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiStar, FiTrash2 } from 'react-icons/fi';
import { put } from '@vercel/blob';

interface DealImage {
  id?: number;
  image_url: string;
  is_main: boolean;
  order: number;
  alt_text?: string;
}

interface DealImageUploadProps {
  dealId?: number;
  images: DealImage[];
  onImagesChange: (images: DealImage[]) => void;
  maxImages?: number;
  className?: string;
}

export default function DealImageUpload({
  dealId,
  images,
  onImagesChange,
  maxImages = 5,
  className = ''
}: DealImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    
    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const blob = await put(`deals/${dealId || 'temp'}/image-${Date.now()}-${index}.${file.name.split('.').pop()}`, file, {
          access: 'public',
        });
        
        return {
          image_url: blob.url,
          is_main: images.length === 0 && index === 0, // First image is main if no images exist
          order: images.length + index,
          alt_text: file.name.split('.')[0]
        };
      });
      
      const newImages = await Promise.all(uploadPromises);
      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onImagesChange(reorderedImages);
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_main: i === index
    }));
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // Update order
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onImagesChange(reorderedImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Upload Deal Images
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop images here, or click to select files
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {images.length}/{maxImages} images • PNG, JPG up to 10MB each
          </p>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <FiUpload className="mr-2 h-4 w-4" />
                Select Images
              </>
            )}
          </button>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `Deal image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Main Image Badge */}
              {image.is_main && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <FiStar className="w-3 h-3 mr-1" />
                  Main
                </div>
              )}
              
              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  {!image.is_main && (
                    <button
                      onClick={() => setMainImage(index)}
                      className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                      title="Set as main image"
                    >
                      <FiStar className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Order Number */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {images.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>• First image will be used as the main image in listings</p>
          <p>• Click the star icon to set a different main image</p>
          <p>• Drag images to reorder them</p>
        </div>
      )}
    </div>
  );
}