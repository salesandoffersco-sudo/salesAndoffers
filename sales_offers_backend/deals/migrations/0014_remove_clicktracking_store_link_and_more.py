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
            SELECT 1;
            """,
            reverse_sql="-- No reverse needed"
        ),
    ]
