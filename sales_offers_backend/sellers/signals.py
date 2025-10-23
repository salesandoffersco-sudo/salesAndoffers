from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SellerProfile

@receiver(post_save, sender=SellerProfile)
def update_deals_on_profile_change(sender, instance, **kwargs):
    """Update deal active status when seller profile is published/unpublished"""
    from deals.models import Deal
    
    # Update all deals for this seller based on profile status
    Deal.objects.filter(seller=instance.seller).update(
        is_active=instance.is_published
    )