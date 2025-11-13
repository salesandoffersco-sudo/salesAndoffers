from django.urls import path
from .views import (
    DealListView, DealDetailView, seller_detail, seller_offers, my_deals, deal_analytics, admin_deals,
    upload_deal_image, delete_deal_image, update_deal_image, track_click, deal_stores, create_store_link
)
from .review_views import create_review, get_deal_reviews
from . import analytics_views
from .featured_views import (
    admin_featured_deals, admin_featured_sellers, set_featured_deal, set_featured_seller,
    remove_featured, get_featured_content
)

urlpatterns = [
    path('', DealListView.as_view(), name='deal-list'),
    path('<int:pk>/', DealDetailView.as_view(), name='deal-detail'),
    path('my-deals/', my_deals, name='my-deals'),
    path('<int:deal_id>/analytics/', deal_analytics, name='deal-analytics'),
    path('analytics/seller/', analytics_views.seller_analytics, name='seller-analytics'),
    path('analytics/deal/<int:deal_id>/', analytics_views.deal_analytics, name='deal-analytics-detailed'),
    path('<int:deal_id>/stores/', deal_stores, name='deal-stores'),
    path('<int:deal_id>/store-links/', create_store_link, name='create-store-link'),
    path('sellers/<int:seller_id>/', seller_detail, name='seller-detail'),
    path('sellers/<int:seller_id>/offers/', seller_offers, name='seller-offers'),
    path('admin/deals/', admin_deals, name='admin-deals'),
    path('reviews/', create_review, name='create-review'),
    path('<int:deal_id>/reviews/', get_deal_reviews, name='deal-reviews'),
    path('<int:deal_id>/images/', upload_deal_image, name='upload-deal-image'),
    path('<int:deal_id>/images/<int:image_id>/', update_deal_image, name='update-deal-image'),
    path('<int:deal_id>/images/<int:image_id>/delete/', delete_deal_image, name='delete-deal-image'),
    path('track-click/', track_click, name='track-click'),
    
    # Featured content management
    path('admin/featured-deals/', admin_featured_deals, name='admin-featured-deals'),
    path('admin/featured-sellers/', admin_featured_sellers, name='admin-featured-sellers'),
    path('admin/set-featured-deal/', set_featured_deal, name='set-featured-deal'),
    path('admin/set-featured-seller/', set_featured_seller, name='set-featured-seller'),
    path('admin/featured/<str:content_type>/<int:object_id>/', remove_featured, name='remove-featured'),
    path('featured/', get_featured_content, name='get-featured-content'),
]