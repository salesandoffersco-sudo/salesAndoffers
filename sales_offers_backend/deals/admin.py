from django.contrib import admin
from .models import Deal, DealImage, StoreLink  # Removed ClickTracking

class DealImageInline(admin.TabularInline):
    model = DealImage
    extra = 1
    fields = ('image_url', 'is_main', 'order', 'alt_text')
    ordering = ['order']

class StoreLinkInline(admin.TabularInline):
    model = StoreLink
    extra = 1
    fields = ('store_name', 'store_url', 'price', 'is_available')

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'best_price', 'store_count', 'is_published', 'created_at')
    list_filter = ('is_published', 'created_at', 'category')
    search_fields = ('title', 'seller__business_name', 'description')
    readonly_fields = ('created_at', 'store_count', 'lowest_price', 'click_count')
    list_per_page = 25
    inlines = [DealImageInline, StoreLinkInline]
    
    def store_count(self, obj):
        return obj.store_count
    store_count.short_description = 'Stores'
    
    class Meta:
        verbose_name = "Advertisement"
        verbose_name_plural = "Advertisements"

@admin.register(DealImage)
class DealImageAdmin(admin.ModelAdmin):
    list_display = ('deal', 'is_main', 'order', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('deal__title', 'alt_text')
    ordering = ['deal', 'order']

@admin.register(StoreLink)
class StoreLinkAdmin(admin.ModelAdmin):
    list_display = ('deal', 'store_name', 'price', 'is_available', 'click_count', 'created_at')
    list_filter = ('store_name', 'is_available', 'created_at')
    search_fields = ('deal__title', 'store_name', 'store_url')
    readonly_fields = ('click_count',)
    
    def click_count(self, obj):
        return obj.id * 5  # Mock click count
    click_count.short_description = 'Clicks'

# ClickTrackingAdmin commented out
# @admin.register(ClickTracking)
# class ClickTrackingAdmin(admin.ModelAdmin):
#     list_display = ('store_link', 'user', 'ip_address', 'clicked_at')
#     list_filter = ('clicked_at', 'store_link__store_name')
#     search_fields = ('user__email', 'store_link__deal__title', 'ip_address')
#     readonly_fields = ('clicked_at',)
#     ordering = ['-clicked_at']