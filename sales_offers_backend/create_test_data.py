#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from sellers.models import Seller
from deals.models import Deal
from datetime import datetime, timedelta
from django.utils import timezone

# Create test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com', 'first_name': 'Test', 'last_name': 'User'}
)
if created:
    user.set_password('testpass123')
    user.save()
    print(f'Created user: {user.username}')
else:
    print(f'User exists: {user.username}')

# Create test seller
seller, created = Seller.objects.get_or_create(
    user=user,
    defaults={
        'business_name': 'Test Business',
        'business_description': 'A test business',
        'address': 'Test Address',
        'rating': 4.5
    }
)
if created:
    print(f'Created seller: {seller.business_name}')
else:
    print(f'Seller exists: {seller.business_name}')

# Create test deal
deal, created = Deal.objects.get_or_create(
    title='Test Deal',
    defaults={
        'description': 'A test deal for payment testing',
        'original_price': 5000.00,
        'discounted_price': 3000.00,
        'discount_percentage': 40,
        'seller': seller,
        'category': 'Services',
        'location': 'Nairobi',
        'max_vouchers': 100,
        'min_purchase': 1,
        'max_purchase': 5,
        'expires_at': timezone.now() + timedelta(days=30),
        'redemption_deadline': timezone.now() + timedelta(days=25),
        'is_active': True
    }
)
if created:
    print(f'Created deal: {deal.title} (ID: {deal.id})')
else:
    print(f'Deal exists: {deal.title} (ID: {deal.id})')

print("Test data setup complete!")