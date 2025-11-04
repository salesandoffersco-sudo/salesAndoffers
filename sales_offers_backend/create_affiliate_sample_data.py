#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from deals.models import Deal, StoreLink
from sellers.models import Seller

def create_sample_store_links():
    """Create sample store links for existing deals"""
    
    # Sample store data
    stores = [
        {'name': 'Jumia', 'base_url': 'https://jumia.co.ke/product/'},
        {'name': 'Kilimall', 'base_url': 'https://kilimall.co.ke/product/'},
        {'name': 'Amazon', 'base_url': 'https://amazon.com/product/'},
        {'name': 'AliExpress', 'base_url': 'https://aliexpress.com/item/'},
        {'name': 'eBay', 'base_url': 'https://ebay.com/itm/'},
    ]
    
    deals = Deal.objects.all()[:10]  # Get first 10 deals
    
    for deal in deals:
        print(f"Adding store links for: {deal.title}")
        
        # Add 2-4 random stores per deal
        import random
        selected_stores = random.sample(stores, random.randint(2, 4))
        
        for i, store in enumerate(selected_stores):
            # Generate realistic prices with variation
            base_price = random.randint(1000, 50000)
            price_variation = random.uniform(0.8, 1.2)
            price = int(base_price * price_variation)
            
            store_link = StoreLink.objects.create(
                deal=deal,
                store_name=store['name'],
                store_url=f"{store['base_url']}{deal.id}-{store['name'].lower()}",
                price=price,
                is_available=random.choice([True, True, True, False])  # 75% available
            )
            
            print(f"  - {store['name']}: KSh {price:,}")
        
        # Update deal's best_price
        available_links = deal.store_links.filter(is_available=True, price__isnull=False)
        if available_links.exists():
            best_price = min(link.price for link in available_links)
            deal.best_price = best_price
            deal.save()
            print(f"  Best price: KSh {best_price:,}")
        
        print()

if __name__ == '__main__':
    print("Creating sample affiliate store links...")
    create_sample_store_links()
    print("Sample data created successfully!")