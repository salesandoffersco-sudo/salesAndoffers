# Generated migration to make all users both buyers and sellers

from django.db import migrations

def make_all_users_buyers_sellers(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.all().update(is_buyer=True, is_seller=True)

def reverse_migration(apps, schema_editor):
    # Cannot reverse this migration safely
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_firebase_fields'),
    ]

    operations = [
        migrations.RunPython(make_all_users_buyers_sellers, reverse_migration),
    ]