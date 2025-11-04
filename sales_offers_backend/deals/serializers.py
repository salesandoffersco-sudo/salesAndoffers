from rest_framework import serializers
from .models import Deal, DealImage, StoreLink, ClickTracking  # Removed Voucher
from sellers.serializers import SellerSerializer

class DealImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealImage
        fields = ['id', 'image_url', 'is_main', 'order', 'alt_text']

class StoreLinkSerializer(serializers.ModelSerializer):
    click_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StoreLink
        fields = ['id', 'store_name', 'store_url', 'price', 'is_available', 'click_count', 'created_at']
    
    def get_click_count(self, obj):
        return obj.clicks.count()

class DealSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    store_count = serializers.ReadOnlyField()
    lowest_price = serializers.ReadOnlyField()
    click_count = serializers.ReadOnlyField()
    images = DealImageSerializer(many=True, read_only=True)
    store_links = StoreLinkSerializer(many=True, read_only=True)
    
    class Meta:
        model = Deal
        fields = [
            'id', 'title', 'description', 'best_price', 'image', 'main_image', 'images', 
            'seller', 'category', 'location', 'store_count', 'lowest_price', 'click_count',
            'store_links', 'status', 'is_published', 'created_at', 'expires_at'
        ]
        read_only_fields = ['store_count', 'lowest_price', 'click_count', 'images', 'store_links']

class ClickTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClickTracking
        fields = ['id', 'store_link', 'user', 'ip_address', 'clicked_at']
        read_only_fields = ['clicked_at']

# Voucher serializer commented out for affiliate platform
# class VoucherSerializer(serializers.ModelSerializer):
#     deal = DealSerializer(read_only=True)
#     
#     class Meta:
#         model = Voucher
#         fields = [
#             'id', 'code', 'deal', 'quantity', 'total_amount', 'status',
#             'qr_code', 'purchased_at', 'redeemed_at', 'expires_at'
#         ]
#         read_only_fields = ['code', 'qr_code', 'purchased_at', 'redeemed_at']