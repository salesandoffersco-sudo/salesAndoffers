from django.db import models
from django.conf import settings

class Seller(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    business_name = models.CharField(max_length=200)
    business_description = models.TextField()
    business_logo = models.URLField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews = models.IntegerField(default=0)
    address = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.business_name

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    price_ksh = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField()
    max_offers = models.IntegerField()
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name