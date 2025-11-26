# Landing Page Carousel Integration

## Overview
Updated the landing page to use the same featured content data for both the HeroCarousel and the Featured Deals sections, ensuring consistency across the platform.

## Changes Made

### 1. Import Addition
- Added `HeroCarousel` component import to the landing page

### 2. State Management
- Added `carouselItems` state to store transformed carousel data
- Maintained existing `featuredDeals` and `featuredSellers` states

### 3. Data Transformation
- Updated `fetchFeaturedContent()` to transform featured deals data into carousel format
- Maps deal properties to carousel item interface:
  - `id` → `id`
  - `title` → `title` 
  - `description` → `description`
  - `price_range` or `best_price` → `discounted_price`
  - Mock calculation for `original_price` (20% markup)
  - Default `average_rating` of 4.5
  - `main_image` or `image` → `main_image`
  - `category` → `category`
  - `discount_percentage` or default 20%

### 4. Component Integration
- Added `HeroCarousel` component to the landing page layout
- Positioned above the hero section
- Only renders when `carouselItems` has data

## Benefits

### Data Consistency
- Both carousel and featured sections use the same API data
- No duplicate API calls or data management
- Consistent featured content across components

### User Experience
- Prominent carousel showcases top deals immediately
- Seamless integration with existing landing page design
- Interactive 3D carousel for engaging user experience

### Performance
- Single API call serves multiple components
- Efficient data transformation and caching
- Reduced loading times

## Technical Implementation

### Data Flow
1. **API Call**: Single request to `/api/deals/featured/`
2. **Data Split**: Response data used for both carousel and sections
3. **Transformation**: Deals data mapped to carousel format
4. **Rendering**: Both components render with consistent data

### Carousel Format
```typescript
interface CarouselItem {
  id: number;
  title: string;
  description: string;
  discounted_price: number;
  original_price: number;
  average_rating: number;
  main_image: string;
  category: string;
  discount_percentage?: number;
}
```

## Future Enhancements

- Add real rating data from reviews
- Calculate actual original prices from historical data
- Add carousel-specific featured content management
- Implement carousel analytics tracking
- Add carousel customization options in admin panel