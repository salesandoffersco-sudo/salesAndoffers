from rest_framework import serializers
from .models import Deal, Voucher
from sellers.serializers import SellerSerializer

class DealSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    vouchers_sold = serializers.ReadOnlyField()
    vouchers_available = serializers.ReadOnlyField()
    
    class Meta:
        model = Deal
        fields = [
            'id', 'title', 'description', 'original_price', 'discounted_price',
            'discount_percentage', 'image', 'seller', 'category', 'location',
            'max_vouchers', 'min_purchase', 'max_purchase', 'vouchers_sold',
            'vouchers_available', 'redemption_instructions', 'status', 'is_active',
            'created_at', 'expires_at', 'redemption_deadline'
        ]
        read_only_fields = ['vouchers_sold', 'vouchers_available']

class VoucherSerializer(serializers.ModelSerializer):
    deal = DealSerializer(read_only=True)
    
    class Meta:
        model = Voucher
        fields = [
            'id', 'code', 'deal', 'quantity', 'total_amount', 'status',
            'qr_code', 'purchased_at', 'redeemed_at', 'expires_at'
        ]
        read_only_fields = ['code', 'qr_code', 'purchased_at', 'redeemed_at']