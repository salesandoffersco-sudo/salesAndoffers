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

  const updateBackground = () => {
    const activeSlideImg = items[currentIndex]?.image;
    if (!activeSlideImg) return;
    
    const targetBg = isBg1Active ? '.hero-bg-2' : '.hero-bg-1';
    const activeBg = isBg1Active ? '.hero-bg-1' : '.hero-bg-2';
    
    const targetElement = document.querySelector(targetBg) as HTMLElement;
    const activeElement = document.querySelector(activeBg) as HTMLElement;
    
    if (targetElement && activeElement) {
      targetElement.style.backgroundImage = `url(${activeSlideImg})`;
      targetElement.style.opacity = '1';
      activeElement.style.opacity = '0';
    }
  };

  const navigate = (direction: number) => {
    const newIndex = (currentIndex + direction + totalSlides) % totalSlides;
    setCurrentRotation(prev => prev + direction * -angle);
    setCurrentIndex(newIndex);
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

  // Animate desktop details
  const animateDetails = () => {
    const detailsElements = document.querySelectorAll('.details-content');
    detailsElements.forEach(el => {
      el.classList.remove('opacity-0', 'translate-y-5');
      el.classList.add('opacity-100', 'translate-y-0');
    });
  };

  useEffect(() => {
    if (totalSlides > 0) {
      updateCarousel();
      updateBackground();
      setTimeout(animateDetails, 400); // Delay for smooth transition
      startAutoPlay();
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, currentRotation, totalSlides]);

  // Update background when currentIndex changes
  useEffect(() => {
    updateBackground();
    setTimeout(animateDetails, 400);
  }, [currentIndex, isBg1Active]);

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
    <section className={`relative min-h-screen lg:min-h-screen md:min-h-[80vh] sm:min-h-[70vh] min-h-[60vh] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Dynamic Background */}
      <div 
        className={`hero-bg-1 absolute inset-0 bg-cover bg-center transition-opacity duration-1200 ${isBg1Active ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${currentItem?.image})`,
          filter: 'blur(25px) brightness(0.6)',
          transform: 'scale(1.1)'
        }}
      />
      <div 
        className={`hero-bg-2 absolute inset-0 bg-cover bg-center transition-opacity duration-1200 ${!isBg1Active ? 'opacity-100' : 'opacity-0'}`}
        style={{
          filter: 'blur(25px) brightness(0.6)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Left Details - Desktop Only */}
        <div className="hidden lg:block flex-1 text-white text-left pr-8">
          <div className="details-content opacity-0 transform translate-y-5 transition-all duration-600">
            <h1 className="text-4xl xl:text-5xl font-extrabold mb-4 text-shadow-lg">
              {currentItem?.title}
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed max-w-md">
              {currentItem?.description}
            </p>
          </div>
        </div>

        {/* 3D Carousel */}
        <div className="relative flex-shrink-0" style={{
          width: 'min(280px, 80vw)',
          height: 'min(420px, 60vh)'
        }}>
          <div className="relative w-full h-full" style={{ perspective: '2000px' }}>
            <div 
              ref={carouselRef}
              className="w-full h-full absolute transition-transform duration-700 ease-out"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`carousel-slide absolute rounded-3xl overflow-hidden shadow-2xl bg-white/5 border border-white/20 cursor-pointer transition-all duration-700 ${
                    index === currentIndex ? 'active brightness-100' : 'brightness-60'
                  }`}
                  style={{
                    width: 'min(280px, 80vw)',
                    height: 'min(420px, 60vh)'
                  }}
                  onClick={() => {
                    if (index !== currentIndex) {
                      const diff = index - currentIndex;
                      const shortestPath = Math.abs(diff) > totalSlides / 2 
                        ? diff > 0 ? diff - totalSlides : diff + totalSlides 
                        : diff;
                      setCurrentRotation(prev => prev + shortestPath * -angle);
                      setCurrentIndex(index);
                      setIsBg1Active(prev => !prev);
                      resetAutoPlay();
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

                  {/* Mobile Details Overlay - Show on tablets and mobile */}
                  <div className={`lg:hidden absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white transition-all duration-500 ${
                    index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <h3 className="text-base sm:text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-300 mb-2 line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through">{item.originalPrice}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="bg-white text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1"
                      >
                        <FiShoppingCart className="w-3 h-3" />
                        Add to Cart
                      </button>
                    </div>
                    <div className="flex items-center text-yellow-400 text-sm">
                      {generateStars(item.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Responsive positioning */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110 z-20"
            style={{
              left: 'clamp(-60px, -15vw, -10px)'
            }}
          >
            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110 z-20"
            style={{
              right: 'clamp(-60px, -15vw, -10px)'
            }}
          >
            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Right Details - Desktop Only */}
        <div className="hidden lg:block flex-1 text-white text-right pl-8">
          <div className="details-content opacity-0 transform translate-y-5 transition-all duration-600">
            <div className="text-4xl xl:text-5xl font-bold mb-2">
              {currentItem?.price}
            </div>
            <div className="flex justify-end text-yellow-400 text-2xl xl:text-3xl space-x-1">
              {generateStars(currentItem?.rating || 0)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}