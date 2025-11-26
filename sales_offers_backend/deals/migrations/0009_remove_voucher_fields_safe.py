# Safe removal of voucher-related fields for affiliate platform
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0008_affiliate_platform_setup'),
    ]

    operations = [
        # Add coupon fields to StoreLink
        migrations.AddField(
            model_name='storelink',
            name='coupon_code',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='storelink',
            name='coupon_discount',
            field=models.CharField(blank=True, max_length=20),
        ),
        
        # Remove voucher-related fields from Deal if they exist
        migrations.RunSQL(
            """
            SELECT 1;
            """,
            reverse_sql="-- No reverse SQL needed"
        ),
        
        # Drop voucher tables if they exist
        migrations.RunSQL(
            """
            DROP TABLE IF EXISTS deals_voucherredemption;
            DROP TABLE IF EXISTS deals_voucher;
            """,
            reverse_sql="-- No reverse SQL needed"
        ),
    ]