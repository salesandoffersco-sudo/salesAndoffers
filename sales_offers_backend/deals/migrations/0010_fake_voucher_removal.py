# Fake migration to handle voucher removal without errors
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0009_remove_voucher_fields_safe'),
    ]

    operations = [
        # This migration does nothing but marks voucher removal as complete
        migrations.RunSQL(
            "SELECT 1;",  # No-op SQL
            reverse_sql="SELECT 1;"
        ),
    ]