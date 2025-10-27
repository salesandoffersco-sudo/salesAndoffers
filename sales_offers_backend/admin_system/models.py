from django.db import models
from django.conf import settings
from django.utils import timezone

class SystemLog(models.Model):
    LEVEL_CHOICES = [
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]
    
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='info')
    message = models.TextField()
    source = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']

class SecurityEvent(models.Model):
    TYPE_CHOICES = [
        ('login_attempt', 'Login Attempt'),
        ('failed_login', 'Failed Login'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('account_locked', 'Account Locked'),
        ('password_reset', 'Password Reset'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    timestamp = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    location = models.CharField(max_length=100, blank=True)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='low')
    details = models.TextField()
    resolved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-timestamp']

class SystemSettings(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name_plural = "System Settings"

class Report(models.Model):
    REPORT_TYPES = [
        ('revenue', 'Revenue Report'),
        ('users', 'User Activity Report'),
        ('deals', 'Deals Performance'),
        ('sellers', 'Seller Analytics'),
    ]
    
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    date_range = models.CharField(max_length=20)
    file_path = models.CharField(max_length=500)
    file_size = models.CharField(max_length=20)
    format = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['-created_at']