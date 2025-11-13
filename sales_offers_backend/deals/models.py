from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from sellers.models import Seller
from categories.models import Category
import uuid
import qrcode
from io import BytesIO
import base64

class Deal(models.Model):
    DEAL_STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    best_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.URLField(blank=True, null=True)
    main_image = models.URLField(blank=True, null=True)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='deals')
    category = models.CharField(max_length=100, blank=True, default='General')
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=DEAL_STATUS_CHOICES, default='pending')
    is_published = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    # Featured content fields
    is_featured = models.BooleanField(default=False)
    featured_priority = models.IntegerField(default=0)  # Higher number = higher priority
    featured_until = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Offer"
        verbose_name_plural = "Offers"
    
    @property
    def store_count(self):
        return self.store_links.filter(is_available=True).count()
    
    @property
    def lowest_price(self):
        prices = [link.price for link in self.store_links.filter(is_available=True) if link.price]
        return min(prices) if prices else None
    
    @property
    def highest_price(self):
        prices = [link.price for link in self.store_links.filter(is_available=True) if link.price]
        return max(prices) if prices else None
    
    @property
    def price_range(self):
        low = self.lowest_price
        high = self.highest_price
        if low and high:
            if low == high:
                return f"KSh {low:,.0f}"
            return f"KSh {low:,.0f} - {high:,.0f}"
        return "Price varies"
    
    @property
    def click_count(self):
        return self.store_links.count() * 15
    
    @property
    def view_count(self):
        return self.id * 25  # Mock view count
    
    @property
    def like_count(self):
        return self.id * 8  # Mock like count

class StoreLink(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='store_links')
    store_name = models.CharField(max_length=100)
    store_url = models.URLField(max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    coupon_code = models.CharField(max_length=50, blank=True)
    coupon_discount = models.CharField(max_length=20, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['deal', 'store_name']
        ordering = ['price']
    
    def __str__(self):
        return f"{self.deal.title} - {self.store_name}"

class DealImage(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    is_main = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    alt_text = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['deal', 'order']
    
    def __str__(self):
        return f"{self.deal.title} - Image {self.order}"

class Review(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('deal', 'customer')
    
    def __str__(self):
        return f"{self.customer.username} - {self.deal.title} ({self.rating}/5)"

# Featured content management
class FeaturedContent(models.Model):
    CONTENT_TYPES = [
        ('deal', 'Deal'),
        ('seller', 'Seller'),
    ]
    
    ALGORITHM_TYPES = [
        ('manual', 'Manual Selection'),
        ('likes', 'Most Liked'),
        ('views', 'Most Viewed'),
        ('clicks', 'Most Clicked'),
        ('subscription', 'Premium Subscription'),
    ]
    
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    object_id = models.PositiveIntegerField()
    algorithm = models.CharField(max_length=20, choices=ALGORITHM_TYPES, default='manual')
    priority = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['content_type', 'object_id']
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"Featured {self.content_type} #{self.object_id}"