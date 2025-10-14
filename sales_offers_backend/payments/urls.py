from django.urls import path
from . import views

urlpatterns = [
    path('initialize/', views.initialize_payment, name='initialize_payment'),
    path('webhook/', views.paystack_webhook, name='paystack_webhook'),
    path('verify/', views.verify_payment, name='verify_payment'),
    path('my-vouchers/', views.my_vouchers, name='my_vouchers'),
]