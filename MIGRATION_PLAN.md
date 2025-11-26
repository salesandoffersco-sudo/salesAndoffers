# Migration Plan: Ecommerce to Advertising Platform

## Overview
Transform the current ecommerce platform into an advertising/affiliate platform where sellers advertise their products with external links to actual stores (Jumia, Kilimall, etc.) instead of direct sales.

## Core Changes Required

### 1. Offer Model & Backend Changes
**File**: `sales_offers_backend/offers/models.py`
- **MODIFY**: Create separate `StoreLink` model for multiple store support
- **REMOVE/COMMENT**: `price`, `discount_price`, `stock_quantity` fields
- **MODIFY**: `is_active` → `is_published` (better naming for ads)
- **ADD**: `best_price` field (optional, for comparison display)

**New Model**: `StoreLink`
- `offer` (ForeignKey to Offer)
- `store_name` (CharField)
- `store_url` (URLField)
- `price` (DecimalField, optional)
- `is_available` (BooleanField)
- `created_at` (DateTimeField)

**File**: `sales_offers_backend/offers/serializers.py`
- Update serializers to include new fields
- Remove price-related serialization

### 2. Frontend Offer Cards
**File**: `sales_offers_frontend/components/OfferCard.tsx`
- **REMOVE**: Single price display, discount badges
- **ADD**: Multiple store badges (e.g., "Available on 3 stores")
- **ADD**: Best price display (if available)
- **MODIFY**: "View Details" button → "Compare Stores"
- **ADD**: Quick access to lowest price store

### 3. Offer Details Page
**File**: `sales_offers_frontend/app/offers/[id]/page.tsx`
- **REMOVE**: Quantity selector, "Add to Cart" button
- **ADD**: Store comparison table with prices
- **ADD**: "Shop Now" buttons for each store
- **ADD**: Price comparison chart (visual)
- **ADD**: Store availability status
- **MODIFY**: Layout to focus on store comparison and product description
- **KEEP**: Contact seller functionality (for inquiries)
- **ADD**: "Best Deal" highlighting

### 4. Seller Dashboard
**File**: `sales_offers_frontend/app/dashboard/seller/offers/page.tsx`
- **MODIFY**: "Create Offer" → "Create Advertisement"
- **UPDATE**: Table columns to show store name instead of price
- **ADD**: Click tracking metrics (future feature)

**File**: `sales_offers_frontend/app/dashboard/seller/offers/create/page.tsx`
- **REMOVE**: Single price, discount, stock fields
- **ADD**: Dynamic store links section
- **ADD**: "Add Store" button for multiple stores
- **ADD**: Store name dropdown with popular options
- **ADD**: Price field for each store (optional)
- **ADD**: URL validation for each store
- **ADD**: Remove store functionality

**File**: `sales_offers_frontend/app/dashboard/seller/offers/edit/[id]/page.tsx`
- Same changes as create page
- **ADD**: Edit existing store links
- **ADD**: Add new store links to existing offers
- **ADD**: Remove store links functionality

### 5. Navigation & Terminology
**Files to Update**:
- `sales_offers_frontend/components/Navbar.tsx`
- `sales_offers_frontend/components/MobileSidenav.tsx`
- `sales_offers_frontend/app/page.tsx` (homepage)

**Changes**:
- "Browse Offers" → "Browse Deals"
- "My Offers" → "My Advertisements"
- Update hero section copy to focus on advertising

### 6. Remove Ecommerce Features
**Files to Comment Out/Remove**:
- Cart functionality (if implemented)
- Checkout process (if implemented)
- Payment integration (if implemented)
- Order management (if implemented)

### 7. Subscription Plans Update
**File**: `sales_offers_frontend/app/dashboard/seller/subscription/page.tsx`
- **MODIFY**: Benefits to focus on advertising features:
  - Number of active advertisements
  - Featured placement
  - Analytics access
  - Priority support

### 8. New User Flows

#### Buyer Flow:
1. **Browse Offers** → See cards with "Available on X stores" badges
2. **Click Offer** → View store comparison page
3. **Compare Prices** → See all available stores with prices
4. **Choose Store** → Click "Shop Now" for preferred store
5. **External Redirect** → Opens store in new tab
6. **Optional**: Contact seller for questions

#### Seller Flow:
1. **Create Advertisement** → Add product details
2. **Add Store Links** → Add multiple store URLs and prices
3. **Publish** → Advertisement goes live with store comparison
4. **Manage** → Edit store links, add new stores, update prices
5. **Analytics** → View click-through rates per store (future)

#### Store Comparison Features:
- **Price Comparison Table**: Side-by-side store prices
- **Best Deal Highlighting**: Automatic lowest price detection
- **Availability Status**: Real-time store availability
- **Store Ratings**: Integration with store reputation (future)

## Detailed File Changes

### Backend Changes

#### 1. Offers Model
```python
# sales_offers_backend/offers/models.py
class Offer(models.Model):
    # Existing fields to keep
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='offers/')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Modified fields
    is_published = models.BooleanField(default=True)  # was is_active
    best_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Fields to comment out/remove
    # price = models.DecimalField(max_digits=10, decimal_places=2)
    # discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # stock_quantity = models.PositiveIntegerField(default=0)

class StoreLink(models.Model):
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='store_links')
    store_name = models.CharField(max_length=100)  # Jumia, Kilimall, Amazon, etc.
    store_url = models.URLField(max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['offer', 'store_name']
```

#### 2. StoreLink Serializer
```python
# sales_offers_backend/offers/serializers.py
class StoreLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreLink
        fields = ['id', 'store_name', 'store_url', 'price', 'is_available']

class OfferSerializer(serializers.ModelSerializer):
    store_links = StoreLinkSerializer(many=True, read_only=True)
    lowest_price = serializers.SerializerMethodField()
    store_count = serializers.SerializerMethodField()
    
    def get_lowest_price(self, obj):
        prices = [link.price for link in obj.store_links.all() if link.price and link.is_available]
        return min(prices) if prices else None
    
    def get_store_count(self, obj):
        return obj.store_links.filter(is_available=True).count()
```

#### 3. Create Migration
```bash
cd sales_offers_backend
python manage.py makemigrations offers --name="convert_to_advertising_platform"
python manage.py migrate
```

### Frontend Changes

#### 1. Offer Card Component
**File**: `sales_offers_frontend/components/OfferCard.tsx`
```tsx
// Key changes:
- Display "Available on {store_count} stores" badge
- Show lowest_price if available
- "Compare Stores" button instead of "View Details"
- Quick "Best Deal" button for lowest price store
```

#### 2. Offer Details Page
**File**: `sales_offers_frontend/app/offers/[id]/page.tsx`
```tsx
// New sections:
- Store Comparison Table component
- Price chart visualization
- Individual "Shop Now" buttons per store
- "Best Deal" highlighting
- Store availability indicators
```

#### 3. New Components to Create
**File**: `sales_offers_frontend/components/StoreComparisonTable.tsx`
- Sortable table by price, store name
- Availability status indicators
- Direct shop buttons

**File**: `sales_offers_frontend/components/StoreLinkManager.tsx`
- Dynamic add/remove store links
- Form validation for URLs
- Price input fields

#### 4. Seller Forms Enhancement
**Files**: 
- `sales_offers_frontend/app/dashboard/seller/offers/create/page.tsx`
- `sales_offers_frontend/app/dashboard/seller/offers/edit/[id]/page.tsx`

```tsx
// New form sections:
- StoreLinkManager component integration
- Dynamic store addition (+ Add Store button)
- Popular stores dropdown (Jumia, Kilimall, Amazon, etc.)
- Price comparison preview
- Bulk store import (future feature)
```

## Implementation Priority

### Phase 1: Backend Changes (Day 1)
1. Update Offer model
2. Create and run migrations
3. Update serializers
4. Test API endpoints

### Phase 2: Core Frontend (Day 2)
1. Create StoreComparisonTable component
2. Update OfferCard component for multiple stores
3. Update offer details page with comparison
4. Update seller dashboard offer list

### Phase 3: Forms & Creation (Day 3)
1. Create StoreLinkManager component
2. Update create/edit offer forms
3. Add validation for multiple URLs
4. Test multiple store submissions
5. Add store link API endpoints

### Phase 4: Polish & Testing (Day 4)
1. Update navigation terminology
2. Update homepage copy
3. Test all user flows
4. Update subscription plans page

## Features to Keep
- User authentication (buyers and sellers)
- Seller profiles and ratings
- Messaging system (for inquiries)
- Blog system
- Notification system
- Responsive design
- Dark/light mode

## Features to Remove/Comment Out
- Shopping cart (if exists)
- Checkout process (if exists)
- Payment integration (if exists)
- Order management (if exists)
- Price-related functionality

## New Features to Consider (Future)
- Click tracking per store link
- Analytics dashboard showing best-performing stores
- Featured advertisement placement
- Store partnership badges
- Affiliate commission tracking per store
- Price monitoring and alerts
- Automatic price updates via store APIs
- Store reliability scoring
- Bulk store link import/export

## Testing Checklist
- [ ] Offer creation with multiple store links works
- [ ] Store comparison table displays correctly
- [ ] Price sorting and filtering works
- [ ] External links open in new tabs
- [ ] Best deal highlighting functions
- [ ] Add/remove store links in forms
- [ ] Seller dashboard shows store count
- [ ] Mobile responsiveness for comparison table
- [ ] All existing features (messaging, blog) still work
- [ ] Database migration successful
- [ ] API endpoints return store links data
- [ ] URL validation prevents invalid links
- [ ] Duplicate store prevention works

## Notes
- Keep the messaging system as buyers may want to inquire about products
- Maintain seller profiles as credibility is important for advertising
- Consider adding click tracking for future analytics
- External links should open in new tabs to keep users on the platform
- Validate external URLs to ensure they're legitimate store links