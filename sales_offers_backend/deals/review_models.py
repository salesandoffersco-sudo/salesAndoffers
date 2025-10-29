from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from .models import Deal, Voucher

class Review(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='reviews')
    voucher = models.OneToOneField(Voucher, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('deal', 'customer', 'voucher')
    
    def __str__(self):
        return f"{self.customer.username} - {self.deal.title} ({self.rating}/5)"