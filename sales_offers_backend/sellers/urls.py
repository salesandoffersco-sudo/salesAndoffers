from django.urls import path
from .views import (
    SellerListView, SubscriptionPlanListView, seller_stats, seller_offers, seller_detail,
    subscribe_to_plan, verify_payment, user_subscription, cancel_subscription
)

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
]