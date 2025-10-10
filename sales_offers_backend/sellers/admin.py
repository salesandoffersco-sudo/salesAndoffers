from django.contrib import admin
from .models import Seller, SubscriptionPlan

@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'rating', 'total_reviews', 'created_at')
    list_filter = ('created_at', 'rating')
    search_fields = ('user__username', 'business_name', 'user__email')

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_ksh', 'duration_days', 'max_offers', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)