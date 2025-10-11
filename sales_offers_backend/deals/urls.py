from django.urls import path
from .views import DealListView, DealDetailView, seller_detail, seller_offers

urlpatterns = [
    path('', DealListView.as_view(), name='deal-list'),
    path('<int:pk>/', DealDetailView.as_view(), name='deal-detail'),
    path('sellers/<int:seller_id>/', seller_detail, name='seller-detail'),
    path('sellers/<int:seller_id>/offers/', seller_offers, name='seller-offers'),
]