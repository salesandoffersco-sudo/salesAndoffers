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
        'max_offers': 5,
        'features': ['Basic analytics', 'Email support', 'Standard listing']
    },
    {
        'name': 'Pro',
        'price_ksh': 2999,
        'duration_days': 30,
        'max_offers': 50,
        'features': ['Advanced analytics', 'Priority support', 'Custom branding', 'Featured listings']
    },
    {
        'name': 'Enterprise',
        'price_ksh': 9999,
        'duration_days': 30,
        'max_offers': 999,
        'features': ['Unlimited offers', 'Dedicated manager', 'API access', 'Custom integrations']
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