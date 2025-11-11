# Final state synchronization - tells Django all cleanup is complete
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0016_remove_storelink_unique_deal_store'),
    ]

    operations = [
        # State-only operation to sync Django's understanding with actual database state
        migrations.SeparateDatabaseAndState(
            state_operations=[
                # Tell Django the constraint change is complete
                migrations.RemoveConstraint(
                    model_name='storelink',
                    name='unique_deal_store',
                ),
            ],
            database_operations=[
                # No actual database operations needed
                migrations.RunSQL("SELECT 1;", reverse_sql="SELECT 1;")
            ]
        ),
    ]