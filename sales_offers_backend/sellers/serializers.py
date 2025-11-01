from rest_framework import serializers
from .models import Seller, SubscriptionPlan, Subscription, SellerProfile, Payment

class SellerSerializer(serializers.ModelSerializer):
    total_deals = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Seller
        fields = '__all__'
    
    def get_total_deals(self, obj):
        from deals.models import Deal
        return Deal.objects.filter(seller=obj).count()
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name or 'Unknown',
                'last_name': obj.user.last_name or 'User',
                'profile_picture': getattr(obj.user, 'profile_picture', None),
                'google_picture': getattr(obj.user, 'google_picture', None),
                'is_verified': getattr(obj.user, 'is_verified', False)
            }
        return None

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = ['id', 'user', 'plan', 'status', 'billing_type', 'start_date', 'end_date', 'is_active']
    
    def get_user(self, obj):
        return {
            'username': obj.user.username,
            'email': obj.user.email
        }

class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ['id', 'company_name', 'company_logo', 'cover_image', 'description', 'website', 'phone', 'email', 'address', 'is_published', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()
    reference = serializers.CharField(source='payment_reference')
    
    class Meta:
        model = Payment
        fields = ['id', 'user', 'amount', 'currency', 'payment_method', 'reference', 'status', 'created_at', 'subscription']
    
    def get_user(self, obj):
        return {
            'username': obj.user.username,
            'email': obj.user.email
        }
    
    def get_subscription(self, obj):
        if obj.subscription and obj.subscription.plan:
            return {
                'plan_name': obj.subscription.plan.name
            }
        return None