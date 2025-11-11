# Safe cleanup of all removed models and fields
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0011_final_cleanup'),
    ]

    operations = [
        # Safe removal of all tables and fields that might not exist
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                -- Drop tables if they exist
                DROP TABLE IF EXISTS deals_clicktracking CASCADE;
                DROP TABLE IF EXISTS deals_voucherredemption CASCADE;
                DROP TABLE IF EXISTS deals_voucher CASCADE;
                
                -- Remove fields from deals_deal if they exist
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='discount_percentage') THEN
                    ALTER TABLE deals_deal DROP COLUMN discount_percentage;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='discounted_price') THEN
                    ALTER TABLE deals_deal DROP COLUMN discounted_price;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='is_active') THEN
                    ALTER TABLE deals_deal DROP COLUMN is_active;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_deal' AND column_name='original_price') THEN
                    ALTER TABLE deals_deal DROP COLUMN original_price;
                END IF;
                
                -- Remove voucher field from reviews if it exists
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals_review' AND column_name='voucher_id') THEN
                    ALTER TABLE deals_review DROP COLUMN voucher_id;
                END IF;
                
                -- Remove constraint from storelink if it exists
                IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='unique_deal_store') THEN
                    ALTER TABLE deals_storelink DROP CONSTRAINT unique_deal_store;
                END IF;
            END $$;
            """,
            reverse_sql="-- No reverse needed"
        ),
    ]