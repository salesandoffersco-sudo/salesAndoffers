from django.db import models
from sellers.models import Seller

class Deal(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.IntegerField()
    image = models.URLField(blank=True, null=True)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='deals')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return self.title