import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from sellers.models import SubscriptionPlan

# Create sample subscription plans
plans = [
    {
        'name': 'Basic',
        'price_ksh': 0,
        'duration_days': 30,
        'max_offers': 1,
        'features': {
            'max_offers': 1,
            'blog_posts': 2,
            'analytics': 'basic',
            'support': 'email',
            'branding': False,
            'featured_listings': False,
            'api_access': False
        }
    },
    {
        'name': 'Pro',
        'price_ksh': 2999,
        'duration_days': 30,
        'max_offers': 50,
        'features': {
            'max_offers': 50,
            'blog_posts': 20,
            'analytics': 'advanced',
            'support': 'priority',
            'branding': True,
            'featured_listings': True,
            'api_access': False
        }
    },
    {
        'name': 'Enterprise',
        'price_ksh': 9999,
        'duration_days': 30,
        'max_offers': -1,
        'features': {
            'max_offers': -1,
            'blog_posts': -1,
            'analytics': 'premium',
            'support': 'dedicated',
            'branding': True,
            'featured_listings': True,
            'api_access': True
        }
    }
]

for plan_data in plans:
    plan, created = SubscriptionPlan.objects.get_or_create(
        name=plan_data['name'],
        defaults=plan_data
    )
    if created:
        print(f"Created plan: {plan.name}")
    else:
        print(f"Plan already exists: {plan.name}")

print("Sample data creation completed!")