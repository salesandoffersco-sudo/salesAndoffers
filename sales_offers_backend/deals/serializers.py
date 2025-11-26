from rest_framework import serializers
from .models import Deal, DealImage, StoreLink, PhysicalStore, PhysicalStoreImage
from sellers.serializers import SellerSerializer
from .store_logos import get_store_info

class DealImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealImage
        fields = ['id', 'image_url', 'is_main', 'order', 'alt_text']

class StoreLinkSerializer(serializers.ModelSerializer):
    click_count = serializers.SerializerMethodField()
    store_info = serializers.SerializerMethodField()
    
    class Meta:
        model = StoreLink
        fields = ['id', 'store_name', 'store_url', 'price', 'coupon_code', 'coupon_discount', 'is_available', 'click_count', 'store_info', 'created_at']
    
    def get_click_count(self, obj):
        # Mock click count for now
        return obj.id * 5  # Simple mock based on ID
    
    def get_store_info(self, obj):
        return get_store_info(obj.store_name)

class PhysicalStoreImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalStoreImage
        fields = ['id', 'image_url', 'created_at']

class PhysicalStoreSerializer(serializers.ModelSerializer):
    images = PhysicalStoreImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = PhysicalStore
        fields = ['id', 'store_name', 'address', 'latitude', 'longitude', 'phone_number', 'opening_hours', 'map_url', 'images', 'created_at']

class DealSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    store_count = serializers.ReadOnlyField()
    lowest_price = serializers.ReadOnlyField()
    highest_price = serializers.ReadOnlyField()
    price_range = serializers.ReadOnlyField()
    click_count = serializers.ReadOnlyField()
    images = DealImageSerializer(many=True, read_only=True)
    store_links = StoreLinkSerializer(many=True, read_only=True)
    physical_stores = PhysicalStoreSerializer(many=True, read_only=True)
    
    class Meta:
        model = Deal
        fields = [
            'id', 'title', 'description', 'best_price', 'image', 'main_image', 'images', 
            'seller', 'category', 'location', 'store_count', 'lowest_price', 'highest_price',
            'price_range', 'click_count', 'store_links', 'physical_stores', 'status', 'is_published', 'created_at', 'expires_at'
        ]
        read_only_fields = ['store_count', 'lowest_price', 'highest_price', 'price_range', 'click_count', 'images', 'store_links', 'physical_stores']