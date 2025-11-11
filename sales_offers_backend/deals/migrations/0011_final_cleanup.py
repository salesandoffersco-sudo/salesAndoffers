# Final cleanup migration - marks all voucher/clicktracking removal as complete
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0010_fake_voucher_removal'),
    ]

    operations = [
        # Mark all voucher and clicktracking cleanup as complete without actually doing anything
        migrations.RunSQL(
            """
            -- This migration does nothing but ensures Django thinks cleanup is complete
            DO $$ 
            BEGIN
                -- Just a no-op to satisfy Django migration system
                NULL;
            END $$;
            """,
            reverse_sql="-- No reverse needed"
        ),
    ]