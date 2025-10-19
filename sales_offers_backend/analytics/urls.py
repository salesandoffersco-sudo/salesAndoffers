from django.urls import path
from . import views

urlpatterns = [
    path('seller/', views.seller_analytics, name='seller_analytics'),
    path('seller/<int:seller_id>/', views.seller_analytics, name='seller_analytics_with_id'),
    path('deal/<int:deal_id>/', views.deal_analytics, name='deal_analytics'),
]