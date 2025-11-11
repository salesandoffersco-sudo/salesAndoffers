from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Fix migration issues by marking problematic migrations as applied'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Mark voucher-related migrations as fake applied
            cursor.execute("""
                INSERT INTO django_migrations (app, name, applied) 
                VALUES ('deals', '0010_fake_voucher_removal', NOW())
                ON CONFLICT (app, name) DO NOTHING;
            """)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully fixed migration issues')
        )