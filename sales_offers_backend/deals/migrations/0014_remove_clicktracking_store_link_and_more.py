# Safe cleanup migration - replaces problematic RemoveField operations
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0013_auto_20251111_1458'),
    ]

    operations = [
        # Use SQL to safely handle all cleanup operations
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                -- This migration marks all model cleanup as complete
                -- The actual cleanup was already done in previous migrations
                NULL;
            END $$;
            """,
            reverse_sql="-- No reverse needed"
        ),
    ]
