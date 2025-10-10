#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username='admin').exists():
    admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    print("Superuser 'admin' created successfully.")
else:
    # Update existing admin user to ensure proper permissions
    admin_user = User.objects.get(username='admin')
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    print("Superuser 'admin' permissions updated.")