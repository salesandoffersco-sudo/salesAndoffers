from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Subscription, Payment
from .serializers import SubscriptionSerializer, PaymentSerializer
from .views import (
    SellerListView, SubscriptionPlanListView, seller_stats, seller_offers, seller_detail,
    subscribe_to_plan, verify_payment, user_subscription, cancel_subscription,
    seller_profile, toggle_profile_publish, manage_seller_offer
)
from .withdrawal_views import seller_balance, request_withdrawal, withdrawal_history, bank_list

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_subscriptions(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=403)
    
    subscriptions = Subscription.objects.select_related('user', 'plan').all().order_by('-created_at')
    serializer = SubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payments(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=403)
    
    payments = Payment.objects.select_related('user', 'subscription__plan').all().order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

urlpatterns = [
    path('', SellerListView.as_view(), name='seller-list'),
    path('<int:seller_id>/', seller_detail, name='seller-detail'),
    path('<int:seller_id>/offers/', seller_offers, name='seller-offers'),
    path('subscription-plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('subscribe/<int:plan_id>/', subscribe_to_plan, name='subscribe-to-plan'),
    path('verify-payment/', verify_payment, name='verify-payment'),
    path('subscription/', user_subscription, name='user-subscription'),
    path('cancel-subscription/', cancel_subscription, name='cancel-subscription'),
    path('stats/', seller_stats, name='seller-stats'),
    path('offers/', seller_offers, name='seller-offers'),
    path('offers/<int:offer_id>/', manage_seller_offer, name='manage-seller-offer'),
    path('profile/', seller_profile, name='seller-profile'),
    path('profile/toggle-publish/', toggle_profile_publish, name='toggle-profile-publish'),
    path('balance/', seller_balance, name='seller-balance'),
    path('withdraw/', request_withdrawal, name='request-withdrawal'),
    path('withdrawals/', withdrawal_history, name='withdrawal-history'),
    path('banks/', bank_list, name='bank-list'),
    path('admin/subscriptions/', admin_subscriptions, name='admin-subscriptions'),
    path('admin/payments/', admin_payments, name='admin-payments'),
]