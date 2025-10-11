from .models import Notification, User
from deals.models import Deal
from django.utils import timezone

class NotificationService:
    @staticmethod
    def create_welcome_notification(user):
        """Create welcome notification for new users"""
        Notification.objects.create(
            user=user,
            title="Welcome to Sales & Offers! 🎉",
            message=f"Hi {user.first_name or user.username}! Welcome to our platform. Start exploring amazing deals and offers from verified sellers.",
            type='welcome'
        )
    
    @staticmethod
    def create_offer_notification(users, offer):
        """Create notification for new offers"""
        notifications = []
        for user in users:
            notifications.append(Notification(
                user=user,
                title="New Offer Available! 🏷️",
                message=f"Check out '{offer.title}' with {offer.discount_percentage}% off! Only KES {offer.discounted_price}",
                type='offer',
                related_offer_id=offer.id
            ))
        Notification.objects.bulk_create(notifications)
    
    @staticmethod
    def create_favorite_notification(user, offer):
        """Create notification when favorited offer is updated"""
        Notification.objects.create(
            user=user,
            title="Favorite Offer Updated! ❤️",
            message=f"Your favorite offer '{offer.title}' has been updated. Check it out now!",
            type='favorite',
            related_offer_id=offer.id
        )
    
    @staticmethod
    def create_promotion_notification(users, title, message):
        """Create promotional notifications"""
        notifications = []
        for user in users:
            notifications.append(Notification(
                user=user,
                title=title,
                message=message,
                type='promotion'
            ))
        Notification.objects.bulk_create(notifications)
    
    @staticmethod
    def create_system_notification(user, title, message):
        """Create system notifications"""
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            type='system'
        )
    
    @staticmethod
    def notify_offer_expiring_soon(offer):
        """Notify users about offers expiring soon"""
        from .models import Favorite
        favorited_users = User.objects.filter(
            id__in=Favorite.objects.filter(offer=offer).values_list('user_id', flat=True)
        )
        
        notifications = []
        for user in favorited_users:
            notifications.append(Notification(
                user=user,
                title="Offer Expiring Soon! ⏰",
                message=f"Your favorite offer '{offer.title}' expires soon. Don't miss out!",
                type='favorite',
                related_offer_id=offer.id
            ))
        Notification.objects.bulk_create(notifications)
    
    @staticmethod
    def notify_price_drop(offer, old_price):
        """Notify users about price drops on favorited offers"""
        from .models import Favorite
        favorited_users = User.objects.filter(
            id__in=Favorite.objects.filter(offer=offer).values_list('user_id', flat=True)
        )
        
        notifications = []
        for user in favorited_users:
            notifications.append(Notification(
                user=user,
                title="Price Drop Alert! 💰",
                message=f"Great news! '{offer.title}' price dropped from KES {old_price} to KES {offer.discounted_price}",
                type='favorite',
                related_offer_id=offer.id
            ))
        Notification.objects.bulk_create(notifications)