from django.urls import path
from . import views

urlpatterns = [
    path('seller/', views.seller_analytics, name='seller_analytics'),
    path('deal/<int:deal_id>/', views.deal_analytics, name='deal_analytics'),
]