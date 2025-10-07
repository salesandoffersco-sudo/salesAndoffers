from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_seller = models.BooleanField(default=False)
    is_buyer = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username

