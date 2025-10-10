from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin superuser'

    def handle(self, *args, **options):
        try:
            # Delete existing admin user if exists
            if User.objects.filter(username='admin').exists():
                User.objects.filter(username='admin').delete()
                self.stdout.write('Deleted existing admin user')
            
            # Create new admin user
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_active = True
            admin_user.save()
            
            self.stdout.write(
                self.style.SUCCESS('Successfully created admin user with credentials: admin/admin123')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {e}')
            )