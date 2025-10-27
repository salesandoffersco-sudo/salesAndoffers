from django.contrib import admin
from .models import Deal

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'original_price', 'discounted_price', 'discount_percentage', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'category')
    search_fields = ('title', 'seller__business_name', 'description')
    readonly_fields = ('created_at',)
    list_per_page = 25
    
    class Meta:
        verbose_name = "Offer"
        verbose_name_plural = "Offers"