from django.contrib import admin
from .models import SellerProfile, SubscriptionPlan

@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'subscription_plan', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'subscription_plan', 'created_at')
    search_fields = ('user__username', 'business_name', 'user__email')

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'max_offers', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)