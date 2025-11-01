from django.contrib import admin
from .models import Deal, DealImage

class DealImageInline(admin.TabularInline):
    model = DealImage
    extra = 1
    fields = ('image_url', 'is_main', 'order', 'alt_text')
    ordering = ['order']

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'original_price', 'discounted_price', 'discount_percentage', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'category')
    search_fields = ('title', 'seller__business_name', 'description')
    readonly_fields = ('created_at',)
    list_per_page = 25
    inlines = [DealImageInline]
    
    class Meta:
        verbose_name = "Offer"
        verbose_name_plural = "Offers"

@admin.register(DealImage)
class DealImageAdmin(admin.ModelAdmin):
    list_display = ('deal', 'is_main', 'order', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('deal__title', 'alt_text')
    ordering = ['deal', 'order']