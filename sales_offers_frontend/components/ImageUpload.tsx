"use client";

import React from 'react';
import FileUpload from './FileUpload';
import { FiX, FiImage } from 'react-icons/fi';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSize?: number;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Click to upload image",
  className = "",
  disabled = false,
  maxSize = 5 * 1024 * 1024 // 5MB
}: ImageUploadProps) {
  const handleUploadSuccess = (result: { url: string }) => {
    onChange(result.url);
  };

  const handleUploadError = (error: any) => {
    console.error('Image upload error:', error);
    alert('Failed to upload image. Please try again.');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-48 object-cover rounded-lg border border-[rgb(var(--color-border))]"
          />
          {onRemove && !disabled && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              type="button"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg flex flex-col items-center justify-center bg-[rgb(var(--color-ui))] hover:bg-[rgb(var(--color-ui))]/80 transition-colors">
          <FiImage className="w-12 h-12 text-[rgb(var(--color-muted))] mb-4" />
          <p className="text-[rgb(var(--color-muted))] text-center mb-4">{placeholder}</p>
          <FileUpload
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            accept="image/*"
            maxSize={maxSize}
            buttonText="Choose Image"
            buttonVariant="primary"
            buttonSize="sm"
            showIcon={false}
            disabled={disabled}
          />
        </div>
      )}
      
      {!value && (
        <FileUpload
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          accept="image/*"
          maxSize={maxSize}
          buttonText="Upload Image"
          buttonVariant="outline"
          showIcon={true}
          disabled={disabled}
          className="w-full"
        />
      )}
    </div>
  );
}