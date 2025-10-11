from django.core.management.base import BaseCommand
from accounts.models import User, Notification
from accounts.notification_service import NotificationService

class Command(BaseCommand):
    help = 'Create sample notifications for testing'

    def handle(self, *args, **options):
        users = User.objects.filter(is_active=True)[:5]
        
        if not users.exists():
            self.stdout.write(self.style.ERROR('No active users found'))
            return

        sample_notifications = [
            {
                'title': 'Flash Sale Alert! ⚡',
                'message': 'Limited time offer: 50% off on electronics! Hurry, only 24 hours left.',
                'type': 'promotion'
            },
            {
                'title': 'New Offer in Your Area 📍',
                'message': 'A new seller just joined near you with amazing deals on home appliances.',
                'type': 'offer'
            },
            {
                'title': 'Price Drop Alert! 💰',
                'message': 'Good news! The item in your favorites just dropped in price by 20%.',
                'type': 'favorite'
            },
            {
                'title': 'System Maintenance Notice 🔧',
                'message': 'We will be performing scheduled maintenance tonight from 2-4 AM.',
                'type': 'system'
            }
        ]

        for user in users:
            for notif_data in sample_notifications:
                Notification.objects.create(
                    user=user,
                    title=notif_data['title'],
                    message=notif_data['message'],
                    type=notif_data['type']
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created sample notifications for {users.count()} users')
        )