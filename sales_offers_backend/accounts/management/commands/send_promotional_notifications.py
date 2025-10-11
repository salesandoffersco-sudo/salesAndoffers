from django.core.management.base import BaseCommand
from accounts.models import User
from accounts.notification_service import NotificationService

class Command(BaseCommand):
    help = 'Send promotional notifications to all users'

    def add_arguments(self, parser):
        parser.add_argument('--title', type=str, help='Notification title', required=True)
        parser.add_argument('--message', type=str, help='Notification message', required=True)
        parser.add_argument('--active-only', action='store_true', help='Send only to active users')

    def handle(self, *args, **options):
        title = options['title']
        message = options['message']
        active_only = options.get('active_only', False)

        if active_only:
            users = User.objects.filter(is_active=True)
        else:
            users = User.objects.all()

        NotificationService.create_promotion_notification(users, title, message)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully sent promotional notification to {users.count()} users')
        )