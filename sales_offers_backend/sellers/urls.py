from django.urls import path
from .views import SellerListView, SubscriptionPlanListView, seller_stats, seller_offers

urlpatterns = [
    path('', SellerListView.as_view(), name='seller-list'),
    path('subscription-plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('stats/', seller_stats, name='seller-stats'),
    path('offers/', seller_offers, name='seller-offers'),
]