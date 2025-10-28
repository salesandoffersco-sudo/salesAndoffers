from django.core.management.base import BaseCommand
from django.utils.text import slugify
from categories.models import Category

class Command(BaseCommand):
    help = 'Populate initial categories'

    def handle(self, *args, **options):
        # Create main categories
        services, _ = Category.objects.get_or_create(
            name='Services',
            defaults={'slug': 'services', 'level': 0}
        )
        
        goods, _ = Category.objects.get_or_create(
            name='Goods',
            defaults={'slug': 'goods', 'level': 0}
        )

        # Services subcategories
        service_categories = [
            'Professional Services',
            'Home Services',
            'Health & Wellness',
            'Education & Training',
            'Entertainment',
            'Transportation',
            'Financial Services',
            'Beauty & Personal Care',
            'Food & Dining',
            'Event Services'
        ]

        for cat_name in service_categories:
            Category.objects.get_or_create(
                name=cat_name,
                parent=services,
                defaults={'slug': slugify(cat_name)}
            )

        # Goods subcategories
        goods_categories = [
            'Electronics',
            'Fashion & Clothing',
            'Home & Garden',
            'Sports & Outdoors',
            'Books & Media',
            'Toys & Games',
            'Health & Beauty',
            'Food & Beverages',
            'Automotive',
            'Arts & Crafts'
        ]

        for cat_name in goods_categories:
            Category.objects.get_or_create(
                name=cat_name,
                parent=goods,
                defaults={'slug': slugify(cat_name)}
            )

        # Add some sub-subcategories for Electronics
        electronics = Category.objects.get(name='Electronics', parent=goods)
        electronics_subs = [
            'Smartphones & Tablets',
            'Computers & Laptops',
            'Audio & Headphones',
            'Cameras & Photography',
            'Gaming',
            'Smart Home',
            'Wearables'
        ]

        for sub_name in electronics_subs:
            Category.objects.get_or_create(
                name=sub_name,
                parent=electronics,
                defaults={'slug': slugify(sub_name)}
            )

        # Add some sub-subcategories for Fashion
        fashion = Category.objects.get(name='Fashion & Clothing', parent=goods)
        fashion_subs = [
            'Men\'s Clothing',
            'Women\'s Clothing',
            'Shoes',
            'Accessories',
            'Bags & Luggage',
            'Jewelry & Watches'
        ]

        for sub_name in fashion_subs:
            Category.objects.get_or_create(
                name=sub_name,
                parent=fashion,
                defaults={'slug': slugify(sub_name)}
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated categories')
        )