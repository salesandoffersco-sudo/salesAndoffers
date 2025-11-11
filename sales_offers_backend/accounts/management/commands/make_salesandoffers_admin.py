from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Make salesandoffers.co user an admin with all required permissions'

    def handle(self, *args, **options):
        print("=== MAKING SALESANDOFFERS.CO ADMIN ===" )
        try:
            # Find the user
            user = User.objects.filter(username='salesandoffers.co').first()
            
            if not user:
                print("User salesandoffers.co not found, creating new user...")
                user = User.objects.create_user(
                    username='salesandoffers.co',
                    email='admin@salesandoffers.co',
                    password='SalesOffers2024!'
                )
                print(f"Created new user: {user}")
            else:
                print(f"Found existing user: {user}")
            
            # Set all admin permissions
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            
            print(f"Updated user permissions:")
            print(f"is_staff: {user.is_staff}")
            print(f"is_superuser: {user.is_superuser}")
            print(f"is_active: {user.is_active}")
            
            # Verify permissions
            verify_user = User.objects.get(username='salesandoffers.co')
            print(f"Verification - is_staff: {verify_user.is_staff}")
            print(f"Verification - is_superuser: {verify_user.is_superuser}")
            
            print("=== SALESANDOFFERS.CO ADMIN SETUP SUCCESSFUL ===")
            self.stdout.write(
                self.style.SUCCESS('Successfully made salesandoffers.co an admin user')
            )
        except Exception as e:
            print(f"=== ERROR MAKING ADMIN: {e} ===")
            import traceback
            print(traceback.format_exc())
            self.stdout.write(
                self.style.ERROR(f'Error making admin: {e}')
            )