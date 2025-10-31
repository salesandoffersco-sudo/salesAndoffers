"use client";

import React, { useState } from 'react';
import { FiUser, FiCamera, FiTrash2, FiGlobe } from 'react-icons/fi';
import Button from './Button';
import FileUpload from './FileUpload';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  googlePicture?: string;
  onUpload: (url: string) => void;
  onDelete: () => void;
  onUseGoogle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfilePictureUpload({
  currentPicture,
  googlePicture,
  onUpload,
  onDelete,
  onUseGoogle,
  disabled = false,
  size = 'md'
}: ProfilePictureUploadProps) {
  const [showOptions, setShowOptions] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleUploadSuccess = (result: { url: string }) => {
    onUpload(result.url);
    setShowOptions(false);
  };

  const handleUploadError = (error: any) => {
    console.error('Profile picture upload error:', error);
    alert('Failed to upload profile picture. Please try again.');
  };

  const handleUseGoogle = () => {
    if (googlePicture) {
      onUseGoogle();
      setShowOptions(false);
    }
  };

  const handleDelete = () => {
    onDelete();
    setShowOptions(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-4 border-white shadow-lg`}>
          {currentPicture ? (
            <img
              src={currentPicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser className={`${iconSizes[size]} text-white`} />
          )}
        </div>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={disabled}
          className="absolute -bottom-1 -right-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
        >
          <FiCamera className="w-4 h-4" />
        </button>
      </div>

      {showOptions && (
        <div className="bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-lg p-4 shadow-lg space-y-3 min-w-[200px]">
          <div className="space-y-2">
            <FileUpload
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              buttonText="Upload New Photo"
              buttonVariant="primary"
              buttonSize="sm"
              showIcon={true}
              disabled={disabled}
              className="w-full"
            />
            
            {googlePicture && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseGoogle}
                disabled={disabled}
                className="w-full"
              >
                <FiGlobe className="w-4 h-4 mr-2" />
                Use Google Photo
              </Button>
            )}
            
            {currentPicture && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={disabled}
                className="w-full text-red-500 hover:text-red-700 hover:border-red-300"
              >
                <FiTrash2 className="w-4 h-4 mr-2" />
                Remove Photo
              </Button>
            )}
          </div>
          
          <button
            onClick={() => setShowOptions(false)}
            className="w-full text-sm text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}