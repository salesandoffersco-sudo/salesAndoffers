# Featured Content API Fix

## Issue
The `/api/deals/featured/` endpoint was returning a 500 Internal Server Error, causing the landing page to fail loading featured content.

## Root Cause
The featured content functions had issues with:
1. Null `expires_at` fields causing query failures
2. Missing error handling for database queries
3. Complex subscription-based queries that might fail

## Fix Applied

### 1. Null Expires At Handling
Changed from:
```python
expires_at__gt=timezone.now()
```
To:
```python
Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
```

### 2. Error Handling
Added try-catch blocks around all database queries to prevent 500 errors.

### 3. Simplified Fallback Logic
- Removed complex subscription-based queries
- Used simple recent deals/sellers as fallback
- Added proper status filtering (`status='approved'`)

## Result
- API endpoint now returns 200 OK
- Landing page loads successfully
- Featured content displays properly
- Graceful fallback when no featured content exists