import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from sellers.models import SubscriptionPlan

# Clear existing plans
SubscriptionPlan.objects.all().delete()

# Create plans matching the pricing page
plans = [
    {
        'name': 'Basic Seller',
        'price_ksh': 0,
        'duration_days': 30,
        'max_offers': 5,
        'features': [
            'List up to 5 offers',
            'Basic analytics', 
            'Standard support',
            'No transaction fees'
        ]
    },
    {
        'name': 'Pro Seller',
        'price_ksh': 29,
        'duration_days': 30,
        'max_offers': 50,
        'features': [
            'List up to 50 offers',
            'Advanced analytics',
            'Priority support', 
            'Customizable profile',
            'Email marketing tools'
        ]
    },
    {
        'name': 'Enterprise',
        'price_ksh': 0,  # Contact us pricing
        'duration_days': 30,
        'max_offers': 999,
        'features': [
            'Unlimited offers',
            'Dedicated account manager',
            'Custom integrations',
            'API access',
            '24/7 premium support'
        ]
    }
]

for plan_data in plans:
    plan = SubscriptionPlan.objects.create(**plan_data)
    print(f"Created plan: {plan.name}")

print("Plans updated to match pricing page!")