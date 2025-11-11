# State-only migration to tell Django that removed models are gone
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0014_remove_clicktracking_store_link_and_more'),
    ]

    operations = [
        # This is a state-only migration that tells Django the models are removed
        # without actually trying to execute any database operations
        migrations.SeparateDatabaseAndState(
            state_operations=[
                # Tell Django these models are deleted from the state
                migrations.DeleteModel(name='ClickTracking'),
                migrations.DeleteModel(name='Voucher'),
                migrations.DeleteModel(name='VoucherRedemption'),
                
                # Tell Django these fields are removed from Deal
                migrations.RemoveField(model_name='deal', name='discount_percentage'),
                migrations.RemoveField(model_name='deal', name='discounted_price'),
                migrations.RemoveField(model_name='deal', name='is_active'),
                migrations.RemoveField(model_name='deal', name='max_purchase'),
                migrations.RemoveField(model_name='deal', name='max_vouchers'),
                migrations.RemoveField(model_name='deal', name='min_purchase'),
                migrations.RemoveField(model_name='deal', name='original_price'),
                migrations.RemoveField(model_name='deal', name='redemption_deadline'),
                migrations.RemoveField(model_name='deal', name='redemption_instructions'),
                
                # Tell Django voucher field is removed from Review
                migrations.RemoveField(model_name='review', name='voucher'),
                
                # Update unique constraints
                migrations.AlterUniqueTogether(name='review', unique_together={('deal', 'customer')}),
                migrations.AlterUniqueTogether(name='storelink', unique_together={('deal', 'store_name')}),
            ],
            database_operations=[
                # No actual database operations - cleanup was done in previous migrations
                migrations.RunSQL("SELECT 1;", reverse_sql="SELECT 1;")
            ]
        ),
    ]