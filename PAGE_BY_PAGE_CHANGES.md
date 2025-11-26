# Page-by-Page Changes: Ecommerce to Affiliate Platform

## 1. Navigation Components

### Navbar (`components/Navbar.tsx`)
**Current**: Cart icon, "Browse Offers", "Sell Now"
**Changes**:
- **REPLACE**: Cart icon (🛒) → Favorites/Wishlist icon (❤️)
- **UPDATE**: "Browse Offers" → "Browse Deals"
- **UPDATE**: "Sell Now" → "Advertise Now"
- **UPDATE**: Cart dropdown → Favorites dropdown
- **ADD**: Quick store filter (Jumia, Kilimall, etc.)

### Mobile Sidenav (`components/MobileSidenav.tsx`)
**Changes**:
- **REPLACE**: "My Cart" → "My Favorites"
- **UPDATE**: "My Offers" → "My Ads"
- **UPDATE**: Navigation icons accordingly

## 2. Homepage (`app/page.tsx`)

### Hero Section
**Current**: "Find Amazing Deals" with buy/sell messaging
**Changes**:
- **UPDATE**: "Compare Prices Across Multiple Stores"
- **UPDATE**: "Find the Best Deals from Trusted Sellers"
- **ADD**: Store logos (Jumia, Kilimall, Amazon)
- **UPDATE**: CTA buttons: "Browse Deals" & "Start Advertising"

### Featured Offers Section
**Changes**:
- **UPDATE**: Section title "Featured Deals"
- **UPDATE**: Offer cards show store count badges
- **ADD**: "Best Price" indicators
- **UPDATE**: "View All Offers" → "View All Deals"

### Stats Section
**Current**: Users, offers, transactions
**Changes**:
- **UPDATE**: "Active Deals", "Partner Stores", "Happy Shoppers"
- **ADD**: Store partnership badges

## 3. Offers/Deals Pages

### Offers List Page (`app/offers/page.tsx`)
**Current**: Grid of offer cards with prices
**Changes**:
- **UPDATE**: Page title "All Deals"
- **ADD**: Store filter sidebar (Jumia, Kilimall, etc.)
- **ADD**: Price range filter (lowest available price)
- **UPDATE**: Sort options: "Best Price", "Most Stores", "Newest"
- **UPDATE**: Offer cards show multiple store badges

### Offer Details Page (`app/offers/[id]/page.tsx`)
**Current**: Single price, add to cart, seller contact
**Changes**:
- **REMOVE**: Add to cart section entirely
- **ADD**: Store comparison table (main feature)
- **ADD**: Price chart/graph
- **ADD**: "Shop Now" buttons for each store
- **ADD**: "Best Deal" highlighting
- **ADD**: Store availability status
- **KEEP**: Seller contact section
- **ADD**: "Add to Favorites" button
- **UPDATE**: Breadcrumb: "Deals" instead of "Offers"

#### Store Comparison Table Layout:
```
| Store    | Price  | Status    | Action     |
|----------|--------|-----------|------------|
| Jumia    | $25.99 | Available | Shop Now ✓ |
| Kilimall | $23.50 | Available | Shop Now ✓ | ← Best Deal
| Amazon   | $27.00 | Out Stock | Notify Me  |
```

## 4. Seller Pages

### Sellers List Page (`app/sellers/page.tsx`)
**Current**: Grid of seller profiles
**Changes**:
- **UPDATE**: Page title "Our Advertising Partners"
- **ADD**: "Partner Stores" badges on seller cards
- **ADD**: "Active Deals" count instead of "Products"
- **UPDATE**: Filter by "Store Partnerships"
- **ADD**: Seller verification badges

### Seller Details Page (`app/sellers/[id]/page.tsx`)
**Current**: Seller info, their offers, contact
**Changes**:
- **UPDATE**: "Products" → "Advertised Deals"
- **ADD**: Store partnership section
- **ADD**: "Stores Available On" badges
- **UPDATE**: Stats: "Active Ads", "Partner Stores", "Total Clicks"
- **KEEP**: Contact seller functionality
- **ADD**: "Follow for New Deals" instead of follow for products

## 5. Dashboard Pages

### Buyer Dashboard (`app/dashboard/page.tsx`)
**Current**: Order history, saved items, profile
**Changes**:
- **REMOVE**: Order history section
- **ADD**: "My Favorites" section (saved deals)
- **ADD**: "Price Alerts" section (future feature)
- **ADD**: "Recently Viewed Deals"
- **UPDATE**: "Saved Items" → "Favorite Deals"
- **ADD**: Click history/analytics (optional)

### Seller Dashboard (`app/dashboard/seller/page.tsx`)
**Current**: Sales analytics, recent orders, quick actions
**Changes**:
- **REMOVE**: Sales analytics, order management
- **ADD**: Click-through analytics per store
- **ADD**: "Active Advertisements" overview
- **ADD**: "Store Performance" metrics
- **UPDATE**: Quick actions: "Create Ad", "Manage Store Links"
- **ADD**: "Top Performing Stores" widget
- **ADD**: "Recent Clicks" activity feed

## 6. Seller Dashboard Sub-pages

### Offers Management (`app/dashboard/seller/offers/page.tsx`)
**Current**: Table with price, stock, status
**Changes**:
- **UPDATE**: Page title "My Advertisements"
- **UPDATE**: Table columns:
  - Title | Stores | Best Price | Clicks | Status | Actions
- **REMOVE**: Stock, original price columns
- **ADD**: Store count column
- **ADD**: Click-through rate column
- **UPDATE**: "Create Offer" → "Create Advertisement"

### Create/Edit Offer (`app/dashboard/seller/offers/create/page.tsx`)
**Current**: Title, description, price, stock, image
**Changes**:
- **UPDATE**: Page title "Create Advertisement"
- **REMOVE**: Price, discount, stock fields
- **ADD**: Store Links section (dynamic)
- **ADD**: "Add Store" button
- **ADD**: Store selection dropdown
- **ADD**: URL validation for each store
- **ADD**: Optional price field per store
- **ADD**: Preview of store comparison

#### Store Links Form Section:
```
Store Links:
┌─────────────────────────────────────┐
│ Store: [Jumia ▼] Price: [$25.99]   │
│ URL: [https://jumia.com/product...] │
│ [Remove Store]                      │
├─────────────────────────────────────┤
│ Store: [Kilimall ▼] Price: [$23.50]│
│ URL: [https://kilimall.com/prod...] │
│ [Remove Store]                      │
└─────────────────────────────────────┘
[+ Add Another Store]
```

### Subscription Plans (`app/dashboard/seller/subscription/page.tsx`)
**Current**: Product limits, transaction fees
**Changes**:
- **UPDATE**: Plan benefits focus on advertising:
  - "Active Advertisements" limit
  - "Store Links per Ad" limit
  - "Featured Placement" access
  - "Analytics Dashboard" access
  - "Priority Support"
- **REMOVE**: Transaction fee mentions
- **ADD**: "Click Tracking" features
- **ADD**: "Store Partnership" benefits

## 7. Authentication Pages

### Login/Register (`app/auth/login/page.tsx`, `app/auth/register/page.tsx`)
**Changes**:
- **UPDATE**: Welcome messages mention "deals" and "advertising"
- **UPDATE**: Seller registration: "Start advertising your products"
- **UPDATE**: Buyer benefits: "Compare prices across stores"

## 8. Blog System (`app/blog/`)
**Current**: Shopping tips, lifestyle content
**Changes**:
- **ADD**: New categories:
  - "Price Comparison Tips"
  - "Store Reviews"
  - "Deal Hunting Guides"
  - "Affiliate Marketing"
- **UPDATE**: Sample posts about deal finding, store comparisons
- **KEEP**: Existing structure, just update content focus

## 9. Messaging System (`app/messages/`)
**Current**: Buyer-seller communication
**Changes**:
- **KEEP**: All existing functionality
- **UPDATE**: Context awareness for deal inquiries
- **ADD**: Quick templates: "Is this available?", "Best store recommendation?"
- **UPDATE**: Conversation starters focus on product inquiries

## 10. Profile Pages (`app/profile/`)
**Changes**:
- **UPDATE**: Buyer profiles: "Favorite Categories", "Preferred Stores"
- **UPDATE**: Seller profiles: "Store Partnerships", "Advertisement Stats"
- **ADD**: Store preference settings
- **ADD**: Price alert preferences

## 11. Search & Filters

### Search Results (`app/search/`)
**Changes**:
- **ADD**: Store-specific filters
- **ADD**: Price range based on lowest available
- **UPDATE**: Sort by "Best Price", "Most Stores"
- **ADD**: "Available Stores" filter checkboxes

## 12. New Components Needed

### `components/StoreComparisonTable.tsx`
- Sortable table with store prices
- Availability indicators
- Direct shop buttons
- Best deal highlighting

### `components/StoreBadge.tsx`
- Small store logos/names
- "Available on X stores" display
- Store count indicators

### `components/FavoritesDropdown.tsx`
- Replace cart dropdown
- Show saved deals
- Quick access to favorites

### `components/StoreLinkManager.tsx`
- Dynamic store addition in forms
- URL validation
- Price input per store

### `components/PriceChart.tsx`
- Visual price comparison
- Historical price tracking (future)
- Best deal highlighting

## 13. API Endpoints to Update

### Backend Changes Needed:
- `GET /api/offers/` - Include store_links in response
- `POST /api/offers/` - Accept store_links array
- `PUT /api/offers/{id}/` - Update store_links
- `GET /api/offers/{id}/` - Include full store comparison data
- `POST /api/favorites/` - Replace cart endpoints
- `GET /api/analytics/clicks/` - Store click tracking

## 14. Database Schema Updates

### New Tables:
- `store_links` (offer_id, store_name, store_url, price, is_available)
- `favorites` (user_id, offer_id) - Replace cart items
- `click_tracking` (user_id, store_link_id, clicked_at) - Analytics

### Modified Tables:
- `offers` - Remove price fields, add best_price
- Remove cart-related tables if they exist

## 15. Mobile Responsiveness

### Key Mobile Changes:
- Store comparison table → Swipeable cards on mobile
- Horizontal scrolling for store options
- Collapsible store details
- Touch-friendly "Shop Now" buttons
- Mobile-optimized store badges

## 16. SEO & Meta Updates

### Page Titles & Descriptions:
- "Compare Prices" instead of "Buy Products"
- "Best Deals Across Multiple Stores"
- Store-specific meta tags
- Deal comparison schema markup

## Implementation Priority:

1. **Navigation & Homepage** (Day 1)
2. **Offer Details with Store Comparison** (Day 2)
3. **Seller Dashboard & Forms** (Day 3)
4. **Remaining Pages & Polish** (Day 4)

This transformation maintains the professional quality while pivoting to a powerful price comparison and affiliate platform that serves both buyers looking for best deals and sellers wanting maximum exposure across multiple stores.