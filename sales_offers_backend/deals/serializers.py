from rest_framework import serializers
from .models import Deal, Voucher, DealImage
from sellers.serializers import SellerSerializer

class DealImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealImage
        fields = ['id', 'image_url', 'is_main', 'order', 'alt_text']

class DealSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    vouchers_sold = serializers.ReadOnlyField()
    vouchers_available = serializers.ReadOnlyField()
    images = DealImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Deal
        fields = [
            'id', 'title', 'description', 'original_price', 'discounted_price',
            'discount_percentage', 'image', 'main_image', 'images', 'seller', 'category', 'location',
            'max_vouchers', 'min_purchase', 'max_purchase', 'vouchers_sold',
            'vouchers_available', 'redemption_instructions', 'status', 'is_active',
            'created_at', 'expires_at', 'redemption_deadline'
        ]
        read_only_fields = ['vouchers_sold', 'vouchers_available', 'images']

class VoucherSerializer(serializers.ModelSerializer):
    deal = DealSerializer(read_only=True)
    
    class Meta:
        model = Voucher
        fields = [
            'id', 'code', 'deal', 'quantity', 'total_amount', 'status',
            'qr_code', 'purchased_at', 'redeemed_at', 'expires_at'
        ]
        read_only_fields = ['code', 'qr_code', 'purchased_at', 'redeemed_at']