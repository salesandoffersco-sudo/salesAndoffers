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
    # Comment out old pricing fields - now handled by StoreLink
    # original_price = models.DecimalField(max_digits=10, decimal_places=2)
    # discounted_price = models.DecimalField(max_digits=10, decimal_places=2)
    # discount_percentage = models.IntegerField()
    best_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.URLField(blank=True, null=True)  # Legacy field, kept for backward compatibility
    main_image = models.URLField(blank=True, null=True)  # Primary image for cards and listings
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='deals')
    category = models.CharField(max_length=100, blank=True, default='General')
    location = models.CharField(max_length=200, blank=True)
    # Comment out voucher-related fields - now it's affiliate links
    # max_vouchers = models.IntegerField(default=100)
    # min_purchase = models.IntegerField(default=1)
    # max_purchase = models.IntegerField(default=10)
    # redemption_instructions = models.TextField(blank=True, default='Present this voucher at the business location to redeem your deal.')
    status = models.CharField(max_length=20, choices=DEAL_STATUS_CHOICES, default='pending')
    is_published = models.BooleanField(default=True)  # Renamed from is_active for clarity
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    # redemption_deadline = models.DateTimeField(null=True, blank=True)

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
        return sum(link.clicks.count() for link in self.store_links.all())

class StoreLink(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='store_links')
    store_name = models.CharField(max_length=100)  # Jumia, Kilimall, Amazon, etc.
    store_url = models.URLField(max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['deal', 'store_name']
        ordering = ['price']
    
    def __str__(self):
        return f"{self.deal.title} - {self.store_name}"

class ClickTracking(models.Model):
    store_link = models.ForeignKey(StoreLink, on_delete=models.CASCADE, related_name='clicks')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    clicked_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Click on {self.store_link.store_name} - {self.clicked_at}"

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

# Voucher models commented out for affiliate platform
# class Voucher(models.Model):
#     VOUCHER_STATUS_CHOICES = [
#         ('pending', 'Pending Payment'),
#         ('paid', 'Paid'),
#         ('redeemed', 'Redeemed'),
#         ('expired', 'Expired'),
#         ('cancelled', 'Cancelled'),
#     ]
#     
#     code = models.CharField(max_length=20, unique=True)
#     deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='vouchers')
#     customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vouchers')
#     quantity = models.IntegerField(default=1)
#     total_amount = models.DecimalField(max_digits=10, decimal_places=2)
#     seller_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     status = models.CharField(max_length=20, choices=VOUCHER_STATUS_CHOICES, default='pending')
#     payment_reference = models.CharField(max_length=100, blank=True)
#     qr_code = models.TextField(blank=True)
#     purchased_at = models.DateTimeField(auto_now_add=True)
#     redeemed_at = models.DateTimeField(null=True, blank=True)
#     expires_at = models.DateTimeField()
#     
#     def save(self, *args, **kwargs):
#         if not self.code:
#             self.code = str(uuid.uuid4())[:12].upper()
#         if not self.qr_code and self.status == 'paid':
#             self.generate_qr_code()
#         super().save(*args, **kwargs)
#     
#     def generate_qr_code(self):
#         qr = qrcode.QRCode(version=1, box_size=10, border=5)
#         qr_data = f"VOUCHER:{self.code}:{self.deal.id}"
#         qr.add_data(qr_data)
#         qr.make(fit=True)
#         
#         img = qr.make_image(fill_color="black", back_color="white")
#         buffer = BytesIO()
#         img.save(buffer, format='PNG')
#         img_str = base64.b64encode(buffer.getvalue()).decode()
#         self.qr_code = f"data:image/png;base64,{img_str}"
#     
#     def __str__(self):
#         return f"Voucher {self.code} - {self.deal.title}"

# class VoucherRedemption(models.Model):
#     voucher = models.OneToOneField(Voucher, on_delete=models.CASCADE, related_name='redemption')
#     redeemed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='redemptions')
#     redeemed_at = models.DateTimeField(auto_now_add=True)
#     notes = models.TextField(blank=True)
#     
#     def __str__(self):
#         return f"Redemption of {self.voucher.code}"

class Review(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='reviews')
    # voucher = models.OneToOneField(Voucher, on_delete=models.CASCADE, related_name='review')  # Commented out for affiliate platform
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('deal', 'customer')  # Removed voucher from unique constraint
    
    def __str__(self):
        return f"{self.customer.username} - {self.deal.title} ({self.rating}/5)"