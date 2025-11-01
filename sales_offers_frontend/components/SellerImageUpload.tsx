"use client";

import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiCamera } from 'react-icons/fi';

interface SellerImageUploadProps {
  type: 'logo' | 'cover';
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
  sellerId?: number;
}

export default function SellerImageUpload({
  type,
  currentImage,
  onImageChange,
  className = '',
  sellerId
}: SellerImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    
    try {
      const filename = `sellers/${sellerId || 'temp'}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: file,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      onImageChange(result.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
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

  const removeImage = () => {
    onImageChange('');
  };

  const isLogo = type === 'logo';
  const aspectRatio = isLogo ? 'aspect-square' : 'aspect-[3/1]';
  const title = isLogo ? 'Business Logo' : 'Cover Image';
  const description = isLogo ? 'Upload your business logo' : 'Upload a cover image for your store';

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </label>
      
      {currentImage ? (
        <div className={`relative ${aspectRatio} w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden`}>
          <img
            src={currentImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Change image"
              >
                <FiCamera className="w-4 h-4" />
              </button>
              <button
                onClick={removeImage}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`${aspectRatio} w-full max-w-md border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full p-4">
            <FiImage className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG up to 5MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
          Uploading...
        </div>
      )}
    </div>
  );
}