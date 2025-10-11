from django.contrib import admin
from .models import Seller, SubscriptionPlan, Subscription, Payment

@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'rating', 'total_reviews', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['business_name', 'user__username', 'user__email']

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_ksh', 'duration_days', 'max_offers', 'is_active']
    list_filter = ['is_active']

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'start_date', 'end_date', 'is_active']
    list_filter = ['status', 'plan', 'start_date']
    search_fields = ['user__username', 'user__email']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'currency', 'status', 'payment_reference', 'created_at']
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['user__username', 'payment_reference']
    readonly_fields = ['payment_reference', 'created_at', 'updated_at']