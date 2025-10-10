from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_seller', 'is_buyer', 'is_google_user')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_seller', 'is_buyer', 'is_google_user')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'is_seller', 'is_buyer', 'firebase_uid', 'profile_picture', 'is_google_user')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'is_seller', 'is_buyer')}),
    )