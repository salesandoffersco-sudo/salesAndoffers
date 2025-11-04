from django.urls import path
from .views import (
    DealListView, DealDetailView, seller_detail, seller_offers, my_deals, deal_analytics, admin_deals,
    upload_deal_image, delete_deal_image, update_deal_image, track_click
)
from .review_views import create_review, get_deal_reviews

urlpatterns = [
    path('', DealListView.as_view(), name='deal-list'),
    path('<int:pk>/', DealDetailView.as_view(), name='deal-detail'),
    path('my-deals/', my_deals, name='my-deals'),
    path('<int:deal_id>/analytics/', deal_analytics, name='deal-analytics'),
    path('sellers/<int:seller_id>/', seller_detail, name='seller-detail'),
    path('sellers/<int:seller_id>/offers/', seller_offers, name='seller-offers'),
    path('admin/deals/', admin_deals, name='admin-deals'),
    path('reviews/', create_review, name='create-review'),
    path('<int:deal_id>/reviews/', get_deal_reviews, name='deal-reviews'),
    path('<int:deal_id>/images/', upload_deal_image, name='upload-deal-image'),
    path('<int:deal_id>/images/<int:image_id>/', update_deal_image, name='update-deal-image'),
    path('<int:deal_id>/images/<int:image_id>/delete/', delete_deal_image, name='delete-deal-image'),
    path('track-click/', track_click, name='track-click'),
]