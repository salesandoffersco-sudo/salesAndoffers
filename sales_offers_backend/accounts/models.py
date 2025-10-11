from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    is_seller = models.BooleanField(default=True)
    is_buyer = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    firebase_uid = models.CharField(max_length=128, blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    is_google_user = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    offer = models.ForeignKey('deals.Deal', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'offer')

    def __str__(self):
        return f"{self.user.username} - {self.offer.title}"

class Notification(models.Model):
    TYPE_CHOICES = [
        ('offer', 'New Offer'),
        ('favorite', 'Favorite Update'),
        ('system', 'System'),
        ('promotion', 'Promotion'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    is_read = models.BooleanField(default=False)
    related_offer_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"

