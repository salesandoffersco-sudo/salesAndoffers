import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from sellers.models import SubscriptionPlan

# Update Enterprise plan price
enterprise = SubscriptionPlan.objects.get(name='Enterprise')
enterprise.price_ksh = 9999
enterprise.save()

print(f"Updated Enterprise plan price to KES {enterprise.price_ksh}")