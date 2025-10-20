from django.urls import path
from .views import (
    SellerListView, SubscriptionPlanListView, seller_stats, seller_offers, seller_detail,
    subscribe_to_plan, verify_payment, user_subscription, cancel_subscription,
    seller_profile, toggle_profile_publish
)
from .withdrawal_views import seller_balance, request_withdrawal, withdrawal_history, bank_list

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
    path('profile/', seller_profile, name='seller-profile'),
    path('profile/toggle-publish/', toggle_profile_publish, name='toggle-profile-publish'),
    path('balance/', seller_balance, name='seller-balance'),
    path('withdraw/', request_withdrawal, name='request-withdrawal'),
    path('withdrawals/', withdrawal_history, name='withdrawal-history'),
    path('banks/', bank_list, name='bank-list'),
]