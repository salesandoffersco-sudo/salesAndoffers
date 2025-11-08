#!/usr/bin/env python
"""
Script to enable Row Level Security (RLS) on all Django tables in Supabase.
This addresses the security warnings from Supabase database linter.
"""

import os
import django
from django.conf import settings
from django.db import connection

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def enable_rls_on_tables():
    """Enable RLS on all Django tables"""
    
    # List of all Django tables that need RLS enabled
    tables = [
        'django_migrations',
        'django_content_type',
        'auth_permission',
        'auth_group',
        'auth_group_permissions',
        'accounts_user_groups',
        'accounts_user_user_permissions',
        'accounts_notification',
        'accounts_favorite',
        'accounts_user',
        'django_admin_log',
        'authtoken_token',
        'blog_blogfollow',
        'blog_bloglike',
        'deals_dealimage',
        'blog_blogcomment',
        'blog_blogcategory',
        'blog_blogpost',
        'blog_blogsubcategory',
        'categories_category',
        'sellers_subscriptionplan',
        'sellers_payment',
        'sellers_subscription',
        'deals_review',
        'deals_deal',
        'deals_storelink',
        'deals_clicktracking',
        'newsletter_newslettersubscriber',
        'messaging_conversation',
        'messaging_conversation_participants',
        'messaging_message',
        'sellers_seller',
        'seller_profiles',
        'django_session',
        'verification_adminnotification',
        'verification_adminnotification_specific_users',
        'verification_ticket',
        'verification_ticketmessage',
        'verification_verificationrequest',
    ]
    
    with connection.cursor() as cursor:
        print("Enabling Row Level Security on Django tables...")
        
        for table in tables:
            try:
                # Enable RLS on the table
                cursor.execute(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;")
                
                # Create a permissive policy for authenticated users
                # This allows full access to authenticated users while blocking anonymous access
                cursor.execute(f"""
                    CREATE POLICY "Enable access for authenticated users" ON public.{table}
                    FOR ALL USING (auth.role() = 'authenticated');
                """)
                
                print(f"✓ Enabled RLS on {table}")
                
            except Exception as e:
                # Skip if policy already exists or other non-critical errors
                if "already exists" in str(e).lower():
                    print(f"✓ RLS already enabled on {table}")
                else:
                    print(f"⚠ Warning for {table}: {e}")
        
        print("\nRLS configuration completed!")
        print("\nNote: This creates permissive policies for authenticated users.")
        print("For production, consider implementing more granular RLS policies based on your security requirements.")

if __name__ == "__main__":
    enable_rls_on_tables()