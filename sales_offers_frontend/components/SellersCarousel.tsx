'use client';

import { useState, useEffect, useRef } from 'react';
import { FiStar, FiMapPin, FiTrendingUp, FiUsers, FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi';

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
  const [currentOffset, setCurrentOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Duplicate sellers for seamless loop only if we have enough sellers
  const duplicatedSellers = sellers.length >= 3 ? [...sellers, ...sellers] : sellers;

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
      stars.push(<FiStar key={`empty-${i}`} className="text-[rgb(var(--color-muted))]" />);
    }
    return stars;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Animation loop
  useEffect(() => {
    if (!isPaused) {
      const animate = () => {
        setCurrentOffset(prev => {
          const newOffset = prev + 0.5;
          const resetPoint = (sellers.length * 320);
          return newOffset >= resetPoint ? 0 : newOffset;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, sellers.length]);

  const navigate = (direction: number) => {
    const cardWidth = 320;
    const newOffset = currentOffset + (direction * cardWidth);
    const maxOffset = sellers.length * cardWidth;
    
    if (newOffset < 0) {
      setCurrentOffset(maxOffset - cardWidth);
    } else if (newOffset >= maxOffset) {
      setCurrentOffset(0);
    } else {
      setCurrentOffset(newOffset);
    }
  };

  return (
    <section className={`relative py-12 bg-[rgb(var(--color-bg))] ${className}`}>
      <div className="container-responsive">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-fg))] mb-2">
              Featured Sellers
            </h2>
            <p className="text-[rgb(var(--color-muted))] max-w-2xl">
              Discover amazing sellers offering incredible deals and quality products
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))] transition-colors"
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <FiPlay className="w-4 h-4" /> : <FiPause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))] transition-colors"
              aria-label="Previous"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-lg bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))] transition-colors"
              aria-label="Next"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex gap-6 transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(-${currentOffset}px)`,
              width: `${duplicatedSellers.length * 320}px`
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {duplicatedSellers.map((seller, index) => (
              <div
                key={sellers.length >= 3 ? `${seller.id}-${Math.floor(index / sellers.length)}` : seller.id}
                className="seller-card flex-shrink-0 w-80 group cursor-pointer"
              >
                {/* Card Container */}
                <div className="card relative overflow-hidden group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                  
                  {/* Cover Image */}
                  <div className="relative h-32 overflow-hidden rounded-t-2xl">
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
                        className="w-16 h-16 rounded-full border-4 border-[rgb(var(--color-card))] shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[rgb(var(--color-card))]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-12 p-6">
                    {/* Business Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-[rgb(var(--color-fg))] mb-1 group-hover:text-[rgb(var(--color-primary))] transition-colors">
                        {seller.businessName}
                      </h3>
                      <p className="text-sm text-[rgb(var(--color-muted))] mb-2">{seller.name}</p>
                      <div className="flex items-center gap-1 text-xs text-[rgb(var(--color-muted))]">
                        <FiMapPin className="w-3 h-3" />
                        {seller.location}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <span className="pill">
                        {seller.category}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {generateStars(seller.rating)}
                      </div>
                      <span className="text-sm font-medium text-[rgb(var(--color-fg))]">
                        {seller.rating}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgb(var(--color-border))]">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <FiTrendingUp className="w-4 h-4" />
                          <span className="font-bold text-sm">{formatNumber(seller.totalSales)}</span>
                        </div>
                        <p className="text-xs text-[rgb(var(--color-muted))]">Sales</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <FiUsers className="w-4 h-4" />
                          <span className="font-bold text-sm">{formatNumber(seller.followers)}</span>
                        </div>
                        <p className="text-xs text-[rgb(var(--color-muted))]">Followers</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full mt-4 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-on-primary))] py-2 px-4 rounded-xl font-medium transition-all duration-300 transform group-hover:scale-105">
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