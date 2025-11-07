#!/usr/bin/env python
"""
Safe cleanup script for unused tables in affiliate platform.
Run this after confirming no references exist.
"""

import os
import django
from django.db import connection

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def cleanup_unused_tables():
    """Remove tables that are no longer used in affiliate platform"""
    
    with connection.cursor() as cursor:
        # List of tables to remove (only truly unused ones)
        tables_to_remove = [
            'transactions_transaction',  # No voucher transactions in affiliate model
            'payments_merchantpayout',   # No merchant payouts in affiliate model
        ]
        
        for table in tables_to_remove:
            try:
                # Check if table exists first
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = %s
                    );
                """, [table])
                
                if cursor.fetchone()[0]:
                    print(f"Dropping table: {table}")
                    cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
                else:
                    print(f"Table {table} does not exist, skipping...")
                    
            except Exception as e:
                print(f"Error dropping table {table}: {e}")
        
        print("Cleanup completed!")

if __name__ == "__main__":
    cleanup_unused_tables()