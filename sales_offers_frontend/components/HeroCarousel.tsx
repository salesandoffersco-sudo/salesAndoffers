'use client';

import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  rating: number;
  image: string;
  category: string;
  discount?: number;
}

interface HeroCarouselProps {
  items: CarouselItem[];
  className?: string;
}

export default function HeroCarousel({ items, className = '' }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isBg1Active, setIsBg1Active] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const { addToCart } = useCart();

  const totalSlides = items.length;
  const angle = totalSlides > 0 ? 360 / totalSlides : 0;

  const generateStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="fill-current" />);
    }
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="fill-current opacity-50" />);
    }
    for (let i = 0; i < 5 - Math.ceil(rating); i++) {
      stars.push(<FiStar key={`empty-${i}`} className="opacity-30" />);
    }
    return stars;
  };

  const updateCarousel = () => {
    if (!carouselRef.current || totalSlides === 0) return;
    
    const carousel = carouselRef.current;
    carousel.style.transform = `rotateY(${currentRotation}deg)`;
    
    const radius = Math.round((280 / 2) / Math.tan(Math.PI / totalSlides));
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    slides.forEach((slide, index) => {
      const slideAngle = index * angle;
      (slide as HTMLElement).style.transform = `rotateY(${slideAngle}deg) translateZ(${radius}px)`;
      slide.classList.toggle('active', index === currentIndex);
    });
  };

  const navigate = (direction: number) => {
    setCurrentRotation(prev => prev + direction * -angle);
    setCurrentIndex(prev => (prev + direction + totalSlides) % totalSlides);
    setIsBg1Active(prev => !prev);
    resetAutoPlay();
  };

  const startAutoPlay = () => {
    autoPlayRef.current = setInterval(() => navigate(1), 5000);
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    startAutoPlay();
  };

  const handleAddToCart = (item: CarouselItem) => {
    addToCart({
      dealId: item.id,
      title: item.title,
      originalPrice: parseFloat(item.originalPrice || item.price),
      discountedPrice: parseFloat(item.price),
      discountPercentage: item.discount || 0,
      maxPurchase: 10,
      minPurchase: 1,
      availableVouchers: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      seller: { id: 1, business_name: 'Featured Store' }
    });
  };

  useEffect(() => {
    if (totalSlides > 0) {
      updateCarousel();
      startAutoPlay();
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, currentRotation, totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (totalSlides === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Dynamic Background */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isBg1Active ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${currentItem?.image})`,
          filter: 'blur(25px) brightness(0.6)',
          transform: 'scale(1.1)'
        }}
      />
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${!isBg1Active ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${items[(currentIndex + 1) % totalSlides]?.image})`,
          filter: 'blur(25px) brightness(0.6)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Left Details - Desktop */}
        <div className="hidden lg:block flex-1 text-white text-left pr-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold mb-4 text-shadow-lg">
            {currentItem?.title}
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-md">
            {currentItem?.description}
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="relative w-[280px] h-[420px] flex-shrink-0">
          <div className="relative w-full h-full" style={{ perspective: '2000px' }}>
            <div 
              ref={carouselRef}
              className="w-full h-full absolute transition-transform duration-700 ease-out"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`carousel-slide absolute w-[280px] h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-white/5 border border-white/20 cursor-pointer transition-all duration-700 ${
                    index === currentIndex ? 'active brightness-100' : 'brightness-60'
                  }`}
                  onClick={() => {
                    if (index !== currentIndex) {
                      const diff = index - currentIndex;
                      const shortestPath = Math.abs(diff) > totalSlides / 2 
                        ? diff > 0 ? diff - totalSlides : diff + totalSlides 
                        : diff;
                      navigate(shortestPath);
                    }
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Desktop CTA Overlay */}
                  <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-600 ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  } hidden lg:block`}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* Mobile Details Overlay */}
                  <div className={`lg:hidden absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent text-white transition-all duration-500 ${
                    index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-300 mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">{item.originalPrice}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1"
                      >
                        <FiShoppingCart className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                    <div className="flex items-center text-yellow-400 text-sm mt-2">
                      {generateStars(item.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-[-80px] top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110 z-20"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute right-[-80px] top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110 z-20"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Details - Desktop */}
        <div className="hidden lg:block flex-1 text-white text-right pl-8">
          <div className="text-4xl xl:text-5xl font-bold mb-2">
            {currentItem?.price}
          </div>
          <div className="flex justify-end text-yellow-400 text-2xl xl:text-3xl space-x-1">
            {generateStars(currentItem?.rating || 0)}
          </div>
        </div>
      </div>

      {/* Mobile Title - Shown below carousel */}
      <div className="lg:hidden absolute bottom-8 left-0 right-0 text-center text-white px-4">
        <h1 className="text-2xl font-bold mb-2">{currentItem?.title}</h1>
        <div className="flex justify-center items-center gap-4">
          <span className="text-xl font-bold">{currentItem?.price}</span>
          <div className="flex text-yellow-400">
            {generateStars(currentItem?.rating || 0)}
          </div>
        </div>
      </div>
    </section>
  );
}