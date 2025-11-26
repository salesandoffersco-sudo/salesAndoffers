# Store Filter Implementation

## Overview
Added store filtering functionality to the offers page to allow users to filter offers by available stores.

## Backend Changes

### 1. New API Endpoint
- **Endpoint**: `GET /api/deals/stores/`
- **Function**: `available_stores()` in `deals/views.py`
- **Purpose**: Returns list of all available stores for filtering
- **Response**: Array of `{id: store_name, label: store_name}` objects

### 2. URL Configuration
- Added URL pattern in `deals/urls.py`: `path('stores/', available_stores, name='available-stores')`

## Frontend Changes

### 1. State Management
- Added `availableStores` state to store list of available stores
- Added `fetchAvailableStores()` function to fetch stores from backend

### 2. Filter Configuration
- Added "Stores" section to `filterSections` array
- Type: `checkbox` to allow multiple store selection
- Options populated from `availableStores` data

### 3. Filtering Logic
- Updated `filteredOffers` logic to check if offers have matching store links
- Filters offers based on selected stores using `offer.store_links` array

### 4. Interface Updates
- Added `store_links` property to `Offer` interface
- Includes store details: `id`, `store_name`, `store_url`, `price`, `coupon_code`, etc.

## How It Works

1. **Data Loading**: On page load, fetches available stores from `/api/deals/stores/`
2. **Filter Display**: Shows stores as checkboxes in the filter sidebar
3. **Filtering**: When stores are selected, filters offers to only show those with matching store links
4. **Real-time**: Filter updates immediately when stores are selected/deselected

## Benefits

- **User Experience**: Users can find offers from their preferred stores
- **Store Discovery**: Users can discover which stores have deals
- **Targeted Shopping**: Helps users focus on stores they trust or prefer
- **Scalable**: Automatically updates as new stores are added to deals

## Technical Notes

- Store filter works with existing FilterSidebar component
- Uses checkbox type for multi-selection
- Integrates with existing filter clearing and chip removal functionality
- Backend endpoint is public (no authentication required)
- Frontend gracefully handles empty store lists

## Future Enhancements

- Add store counts to show how many offers each store has
- Add store logos/icons to filter options
- Add store popularity sorting
- Add store category grouping (e.g., Electronics stores, Fashion stores)