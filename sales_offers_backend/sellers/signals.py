from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SellerProfile

@receiver(post_save, sender=SellerProfile)
def update_deals_on_profile_change(sender, instance, created, **kwargs):
    """Update deal active status when seller profile is published/unpublished"""
    from deals.models import Deal
    
    # Only update deals if this is not a new profile creation
    # and only if the profile was explicitly unpublished
    if not created and not instance.is_published:
        # Only deactivate deals when profile is explicitly unpublished
        Deal.objects.filter(seller=instance.seller, is_active=True).update(
            is_active=False
        )
    elif not created and instance.is_published:
        # When profile is published, we don't automatically activate all deals
        # Let sellers manage their individual deals
        pass