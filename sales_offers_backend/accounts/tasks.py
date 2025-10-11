from datetime import datetime, timedelta
from django.utils import timezone
from .models import User, Notification
from .notification_service import NotificationService
from deals.models import Deal

def send_daily_digest():
    """Send daily digest notifications to active users"""
    yesterday = timezone.now() - timedelta(days=1)
    new_offers = Deal.objects.filter(created_at__gte=yesterday, is_active=True)
    
    if new_offers.exists():
        active_users = User.objects.filter(is_active=True, last_login__gte=timezone.now() - timedelta(days=7))
        
        title = f"Daily Digest: {new_offers.count()} New Offers! 📧"
        message = f"Check out {new_offers.count()} new offers added yesterday. Don't miss out on great deals!"
        
        NotificationService.create_promotion_notification(active_users, title, message)

def check_expiring_offers():
    """Check for offers expiring in 24 hours and notify users"""
    tomorrow = timezone.now() + timedelta(days=1)
    expiring_offers = Deal.objects.filter(
        expires_at__lte=tomorrow,
        expires_at__gte=timezone.now(),
        is_active=True
    )
    
    for offer in expiring_offers:
        NotificationService.notify_offer_expiring_soon(offer)

def cleanup_old_notifications():
    """Clean up notifications older than 30 days"""
    thirty_days_ago = timezone.now() - timedelta(days=30)
    old_notifications = Notification.objects.filter(created_at__lt=thirty_days_ago, is_read=True)
    deleted_count = old_notifications.count()
    old_notifications.delete()
    print(f"Cleaned up {deleted_count} old notifications")