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
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='max_vouchers') THEN
                    ALTER TABLE deals_deal DROP COLUMN max_vouchers;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='min_purchase') THEN
                    ALTER TABLE deals_deal DROP COLUMN min_purchase;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='max_purchase') THEN
                    ALTER TABLE deals_deal DROP COLUMN max_purchase;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='redemption_instructions') THEN
                    ALTER TABLE deals_deal DROP COLUMN redemption_instructions;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='redemption_deadline') THEN
                    ALTER TABLE deals_deal DROP COLUMN redemption_deadline;
                END IF;
            END $$;
            """,
            reverse_sql="-- No reverse SQL needed"
        ),
        
        # Drop voucher tables if they exist
        migrations.RunSQL(
            """
            DROP TABLE IF EXISTS deals_voucherredemption CASCADE;
            DROP TABLE IF EXISTS deals_voucher CASCADE;
            """,
            reverse_sql="-- No reverse SQL needed"
        ),
    ]