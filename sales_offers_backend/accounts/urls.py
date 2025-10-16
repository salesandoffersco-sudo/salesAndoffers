from django.urls import path
from .views import (
    register, login, google_auth, logout, forgot_password, reset_password, verify_email,
    profile, dashboard_stats, favorites, remove_favorite, notifications, 
    update_notification, delete_notification, mark_all_notifications_read,
    toggle_favorite_deal, check_favorite_status
)

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('google/', google_auth, name='google_auth'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/', reset_password, name='reset_password'),
    path('verify-email/', verify_email, name='verify_email'),
    path('profile/', profile, name='profile'),
    path('dashboard-stats/', dashboard_stats, name='dashboard_stats'),
    path('favorites/', favorites, name='favorites'),
    path('favorites/<int:favorite_id>/', remove_favorite, name='remove_favorite'),
    path('notifications/', notifications, name='notifications'),
    path('notifications/<int:notification_id>/', update_notification, name='update_notification'),
    path('notifications/<int:notification_id>/delete/', delete_notification, name='delete_notification'),
    path('notifications/mark-all-read/', mark_all_notifications_read, name='mark_all_notifications_read'),
    path('deals/<int:deal_id>/favorite/', toggle_favorite_deal, name='toggle_favorite_deal'),
    path('deals/<int:deal_id>/favorite/status/', check_favorite_status, name='check_favorite_status'),
]