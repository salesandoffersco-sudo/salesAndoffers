from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin superuser'

    def handle(self, *args, **options):
        print("=== STARTING ADMIN USER CREATION ===")
        try:
            print(f"Current User model: {User}")
            print(f"Total users in database: {User.objects.count()}")
            
            # Delete existing admin user if exists
            if User.objects.filter(username='admin').exists():
                print("Found existing admin user, deleting...")
                User.objects.filter(username='admin').delete()
                print("Deleted existing admin user")
            else:
                print("No existing admin user found")
            
            print("Creating new admin user...")
            # Create new admin user
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            print(f"Created user object: {admin_user}")
            print(f"User ID: {admin_user.id}")
            print(f"Username: {admin_user.username}")
            print(f"Email: {admin_user.email}")
            
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_active = True
            admin_user.save()
            
            print(f"Updated user permissions:")
            print(f"is_staff: {admin_user.is_staff}")
            print(f"is_superuser: {admin_user.is_superuser}")
            print(f"is_active: {admin_user.is_active}")
            
            # Verify user was created
            verify_user = User.objects.get(username='admin')
            print(f"Verification - User exists: {verify_user}")
            print(f"Verification - is_staff: {verify_user.is_staff}")
            print(f"Verification - is_superuser: {verify_user.is_superuser}")
            
            print("=== ADMIN USER CREATION SUCCESSFUL ===")
            self.stdout.write(
                self.style.SUCCESS('Successfully created admin user with credentials: admin/admin123')
            )
        except Exception as e:
            print(f"=== ERROR CREATING ADMIN USER: {e} ===")
            import traceback
            print(traceback.format_exc())
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {e}')
            )