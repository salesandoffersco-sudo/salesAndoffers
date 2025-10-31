"use client";

import React, { useState } from 'react';
import { FiUser, FiX } from 'react-icons/fi';

interface ProfilePictureProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  clickable?: boolean;
  showModal?: boolean;
}

export default function ProfilePicture({
  src,
  alt = 'Profile',
  size = 'md',
  className = '',
  clickable = true,
  showModal = true
}: ProfilePictureProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleClick = () => {
    if (clickable && showModal && src) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 ${
          clickable && src ? 'cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all' : ''
        } ${className}`}
        onClick={handleClick}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <FiUser className={`${iconSizes[size]} text-white`} />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && src && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}