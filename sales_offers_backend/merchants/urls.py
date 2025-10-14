from django.urls import path
from . import views

urlpatterns = [
    path('redeem-voucher/', views.redeem_voucher, name='redeem_voucher'),
    path('verify-voucher/', views.verify_voucher, name='verify_voucher'),
    path('analytics/', views.merchant_analytics, name='merchant_analytics'),
    path('voucher-history/', views.voucher_history, name='voucher_history'),
]