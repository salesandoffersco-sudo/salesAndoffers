from django.db import models
from django.conf import settings
from sellers.models import Seller
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
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.IntegerField()
    image = models.URLField(blank=True, null=True)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='deals')
    category = models.CharField(max_length=100, default='Other')
    location = models.CharField(max_length=200, blank=True)
    max_vouchers = models.IntegerField(default=100)
    min_purchase = models.IntegerField(default=1)
    max_purchase = models.IntegerField(default=10)
    redemption_instructions = models.TextField(blank=True, default='Present this voucher at the business location to redeem your deal.')
    status = models.CharField(max_length=20, choices=DEAL_STATUS_CHOICES, default='pending')
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    redemption_deadline = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
    
    @property
    def vouchers_sold(self):
        return self.vouchers.filter(status='paid').count()
    
    @property
    def vouchers_available(self):
        return max(0, self.max_vouchers - self.vouchers_sold)

class Voucher(models.Model):
    VOUCHER_STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('redeemed', 'Redeemed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='vouchers')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vouchers')
    quantity = models.IntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    seller_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=VOUCHER_STATUS_CHOICES, default='pending')
    payment_reference = models.CharField(max_length=100, blank=True)
    qr_code = models.TextField(blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)
    redeemed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(uuid.uuid4())[:12].upper()
        if not self.qr_code and self.status == 'paid':
            self.generate_qr_code()
        super().save(*args, **kwargs)
    
    def generate_qr_code(self):
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr_data = f"VOUCHER:{self.code}:{self.deal.id}"
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        self.qr_code = f"data:image/png;base64,{img_str}"
    
    def __str__(self):
        return f"Voucher {self.code} - {self.deal.title}"

class VoucherRedemption(models.Model):
    voucher = models.OneToOneField(Voucher, on_delete=models.CASCADE, related_name='redemption')
    redeemed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='redemptions')
    redeemed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Redemption of {self.voucher.code}"