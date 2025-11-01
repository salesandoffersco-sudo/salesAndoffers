from django.db import models
from django.contrib.auth.models import User
from .models import Seller

class SellerProfile(models.Model):
    seller = models.OneToOneField(Seller, on_delete=models.CASCADE, related_name='profile')
    company_name = models.CharField(max_length=200)
    company_logo = models.URLField(blank=True, null=True)
    cover_image = models.URLField(blank=True, null=True)
    description = models.TextField()
    website = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} - {'Published' if self.is_published else 'Draft'}"

    class Meta:
        db_table = 'seller_profiles'