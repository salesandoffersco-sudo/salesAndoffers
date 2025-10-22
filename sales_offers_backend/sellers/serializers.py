from rest_framework import serializers
from .models import Seller, SubscriptionPlan, Subscription, SellerProfile, Payment

class SellerSerializer(serializers.ModelSerializer):
    total_deals = serializers.SerializerMethodField()
    
    class Meta:
        model = Seller
        fields = '__all__'
    
    def get_total_deals(self, obj):
        from deals.models import Deal
        return Deal.objects.filter(seller=obj).count()

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'status', 'start_date', 'end_date', 'is_active']

class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ['id', 'company_name', 'company_logo', 'description', 'website', 'phone', 'email', 'address', 'is_published', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'currency', 'payment_reference', 'status', 'created_at']