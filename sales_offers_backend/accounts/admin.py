from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Favorite, Notification

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_seller', 'is_buyer', 'is_google_user')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_seller', 'is_buyer', 'is_google_user')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'phone', 'address', 'is_seller', 'is_buyer', 'firebase_uid', 'profile_picture', 'is_google_user')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'phone', 'address', 'is_seller', 'is_buyer')}),
    )

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'offer', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'offer__title')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('created_at',)