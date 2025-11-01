from django.core.management.base import BaseCommand
from blog.models import BlogCategory, BlogSubcategory

class Command(BaseCommand):
    help = 'Populate blog categories and subcategories'

    def handle(self, *args, **options):
        categories_data = [
            {
                'name': 'Shopping Tips',
                'icon': 'FiShoppingBag',
                'color': '#10b981',
                'subcategories': ['Deal Hunting', 'Budget Shopping', 'Product Reviews', 'Comparison Guides']
            },
            {
                'name': 'Lifestyle',
                'icon': 'FiHeart',
                'color': '#f59e0b',
                'subcategories': ['Fashion', 'Home & Garden', 'Health & Wellness', 'Travel']
            },
            {
                'name': 'Technology',
                'icon': 'FiSmartphone',
                'color': '#3b82f6',
                'subcategories': ['Gadgets', 'Software', 'Mobile Apps', 'Tech Reviews']
            },
            {
                'name': 'Business',
                'icon': 'FiBriefcase',
                'color': '#8b5cf6',
                'subcategories': ['Entrepreneurship', 'Marketing', 'E-commerce', 'Finance']
            },
            {
                'name': 'Food & Dining',
                'icon': 'FiCoffee',
                'color': '#ef4444',
                'subcategories': ['Recipes', 'Restaurant Reviews', 'Food Deals', 'Cooking Tips']
            },
            {
                'name': 'Entertainment',
                'icon': 'FiPlay',
                'color': '#ec4899',
                'subcategories': ['Movies & TV', 'Music', 'Gaming', 'Events']
            }
        ]

        for cat_data in categories_data:
            category, created = BlogCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'color': cat_data['color'],
                    'description': f'Posts about {cat_data["name"].lower()}'
                }
            )
            
            if created:
                self.stdout.write(f'Created category: {category.name}')
            
            for sub_name in cat_data['subcategories']:
                subcategory, sub_created = BlogSubcategory.objects.get_or_create(
                    category=category,
                    name=sub_name,
                    defaults={'description': f'Posts about {sub_name.lower()}'}
                )
                
                if sub_created:
                    self.stdout.write(f'  Created subcategory: {subcategory.name}')

        self.stdout.write(self.style.SUCCESS('Successfully populated blog categories'))