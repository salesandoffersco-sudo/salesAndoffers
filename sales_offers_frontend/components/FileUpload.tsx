"use client";

import React from 'react';
import { FiUpload, FiImage } from 'react-icons/fi';
import Button from './Button';

interface FileUploadProps {
  onSuccess: (result: { url: string }) => void;
  onError?: (error: any) => void;
  accept?: string;
  maxSize?: number;
  buttonText?: string;
  buttonVariant?: 'primary' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({
  onSuccess,
  onError,
  accept = 'image/*,application/pdf,.doc,.docx',
  maxSize = 10 * 1024 * 1024, // 10MB
  buttonText = 'Upload File',
  buttonVariant = 'outline',
  buttonSize = 'md',
  showIcon = true,
  disabled = false,
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      const error = `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
      if (onError) {
        onError(new Error(error));
      } else {
        alert(error);
      }
      return;
    }

    setUploading(true);

    try {
      const filename = `${Date.now()}-${file.name}`;
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onSuccess({ url: result.url });
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    if (accept.includes('image/*')) {
      return <FiImage className="w-4 h-4 mr-2" />;
    }
    
    return <FiUpload className="w-4 h-4 mr-2" />;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className={className}
      >
        {getIcon()}
        {uploading ? 'Uploading...' : buttonText}
      </Button>
    </>
  );
}