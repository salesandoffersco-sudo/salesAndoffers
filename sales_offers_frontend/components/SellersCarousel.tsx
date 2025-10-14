'use client';

import { useState, useEffect, useRef } from 'react';
import { FiStar, FiMapPin, FiTrendingUp, FiUsers } from 'react-icons/fi';

interface Seller {
  id: number;
  name: string;
  businessName: string;
  category: string;
  rating: number;
  totalSales: number;
  followers: number;
  location: string;
  avatar: string;
  coverImage: string;
  verified: boolean;
  specialOffer?: string;
}

interface SellersCarouselProps {
  sellers: Seller[];
  className?: string;
}

export default function SellersCarousel({ sellers, className = '' }: SellersCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Duplicate sellers for seamless loop
  const duplicatedSellers = [...sellers, ...sellers, ...sellers];

  const generateStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="fill-current text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="fill-current text-yellow-400 opacity-50" />);
    }
    for (let i = 0; i < 5 - Math.ceil(rating); i++) {
      stars.push(<FiStar key={`empty-${i}`} className="text-gray-300" />);
    }
    return stars;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <section className={`relative py-16 overflow-hidden ${className}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20" />
      
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float" />
        <div className="floating-orb absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="floating-orb absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container-responsive">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Featured Sellers
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover amazing sellers offering incredible deals and quality products
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            ref={carouselRef}
            className={`flex gap-6 ${isPaused ? 'sellers-carousel-paused' : 'sellers-carousel-scroll'}`}
            style={{ width: `${duplicatedSellers.length * 320}px` }}
          >
            {duplicatedSellers.map((seller, index) => (
              <div
                key={`${seller.id}-${index}`}
                className="seller-card flex-shrink-0 w-80 group cursor-pointer"
              >
                {/* Card Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:scale-105 group-hover:-translate-y-2">
                  
                  {/* Cover Image */}
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={seller.coverImage} 
                      alt={seller.businessName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Verified Badge */}
                    {seller.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        Verified
                      </div>
                    )}

                    {/* Special Offer Badge */}
                    {seller.specialOffer && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        {seller.specialOffer}
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="absolute top-20 left-6">
                    <div className="relative">
                      <img 
                        src={seller.avatar} 
                        alt={seller.name}
                        className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-12 p-6">
                    {/* Business Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {seller.businessName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{seller.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <FiMapPin className="w-3 h-3" />
                        {seller.location}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                        {seller.category}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {generateStars(seller.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {seller.rating}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                          <FiTrendingUp className="w-4 h-4" />
                          <span className="font-bold text-sm">{formatNumber(seller.totalSales)}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sales</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                          <FiUsers className="w-4 h-4" />
                          <span className="font-bold text-sm">{formatNumber(seller.followers)}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 transform group-hover:scale-105">
                      View Store
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}