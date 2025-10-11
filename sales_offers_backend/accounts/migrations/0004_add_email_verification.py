# Generated migration to add email verification field

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_make_all_users_buyers_sellers'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_email_verified',
            field=models.BooleanField(default=False),
        ),
        # Set existing Google users as email verified
        migrations.RunSQL(
            "UPDATE accounts_user SET is_email_verified = TRUE WHERE is_google_user = TRUE;",
            reverse_sql="UPDATE accounts_user SET is_email_verified = FALSE WHERE is_google_user = TRUE;"
        ),
    ]