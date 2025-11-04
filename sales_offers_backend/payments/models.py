from django.db import models
from django.conf import settings
# from deals.models import Voucher  # Commented out for affiliate platform

# Payment model commented out for affiliate platform - no voucher purchases
# class Payment(models.Model):
#     PAYMENT_STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('success', 'Success'),
#         ('failed', 'Failed'),
#         ('cancelled', 'Cancelled'),
#     ]
#     
#     PAYMENT_METHOD_CHOICES = [
#         ('card', 'Card'),
#         ('bank_transfer', 'Bank Transfer'),
#         ('mobile_money', 'Mobile Money'),
#         ('mpesa', 'M-Pesa'),
#     ]
#     
#     voucher = models.OneToOneField(Voucher, on_delete=models.CASCADE, related_name='payment')
#     customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='voucher_payments')
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     currency = models.CharField(max_length=3, default='KES')
#     payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
#     paystack_reference = models.CharField(max_length=100, unique=True)
#     paystack_access_code = models.CharField(max_length=100, blank=True)
#     status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     
#     def __str__(self):
#         return f"Payment {self.paystack_reference} - {self.amount} {self.currency}"

class MerchantPayout(models.Model):
    PAYOUT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    merchant = models.ForeignKey('sellers.Seller', on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paystack_transfer_code = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=PAYOUT_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Payout to {self.merchant.business_name} - {self.net_amount} KES"