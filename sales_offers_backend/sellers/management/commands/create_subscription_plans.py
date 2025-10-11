from django.core.management.base import BaseCommand
from sellers.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Create default subscription plans'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Basic Seller',
                'price_ksh': 0,
                'duration_days': 30,
                'max_offers': 5,
                'features': [
                    'Up to 5 active offers',
                    'Basic seller profile',
                    'Email support',
                    'Standard listing visibility'
                ]
            },
            {
                'name': 'Pro Seller',
                'price_ksh': 2999,
                'duration_days': 30,
                'max_offers': 50,
                'features': [
                    'Up to 50 active offers',
                    'Enhanced seller profile',
                    'Priority support',
                    'Featured listing placement',
                    'Analytics dashboard',
                    'Bulk upload tools'
                ]
            },
            {
                'name': 'Enterprise',
                'price_ksh': 9999,
                'duration_days': 30,
                'max_offers': -1,  # Unlimited
                'features': [
                    'Unlimited offers',
                    'Premium seller badge',
                    'Dedicated account manager',
                    'Top listing placement',
                    'Advanced analytics',
                    'API access',
                    'Custom branding options'
                ]
            }
        ]

        for plan_data in plans:
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created plan: {plan.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Plan already exists: {plan.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully created/updated subscription plans')
        )