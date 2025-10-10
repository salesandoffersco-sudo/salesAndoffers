from django.contrib import admin
from .models import Deal

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'price', 'discount_percentage', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'category')
    search_fields = ('title', 'seller__user__username', 'description')
    readonly_fields = ('created_at', 'updated_at')