from django.db import models
from django.conf import settings
from sellers.models import Seller

class VerificationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('requires_changes', 'Requires Changes'),
    ]
    
    seller = models.OneToOneField(Seller, on_delete=models.CASCADE, related_name='verification_request')
    business_license = models.FileField(upload_to='verification/licenses/')
    tax_certificate = models.FileField(upload_to='verification/tax/', blank=True, null=True)
    id_document = models.FileField(upload_to='verification/ids/')
    business_registration = models.FileField(upload_to='verification/registration/', blank=True, null=True)
    portfolio_images = models.JSONField(default=list, blank=True)
    additional_documents = models.JSONField(default=list, blank=True)
    
    business_description = models.TextField()
    years_in_business = models.IntegerField()
    number_of_employees = models.IntegerField(default=1)
    annual_revenue = models.CharField(max_length=50, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_verifications')
    
    def __str__(self):
        return f"{self.seller.business_name} - {self.status}"

class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    CATEGORY_CHOICES = [
        ('technical', 'Technical Issue'),
        ('billing', 'Billing'),
        ('account', 'Account'),
        ('verification', 'Verification'),
        ('general', 'General Inquiry'),
        ('bug_report', 'Bug Report'),
        ('feature_request', 'Feature Request'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open')
    
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    attachments = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"#{self.id} - {self.title}"

class TicketMessage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    is_internal = models.BooleanField(default=False)
    attachments = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Message for ticket #{self.ticket.id}"

class AdminNotification(models.Model):
    TYPE_CHOICES = [
        ('notification', 'Notification'),
        ('popup', 'Popup Modal'),
    ]
    
    TARGET_CHOICES = [
        ('all', 'All Users'),
        ('sellers', 'All Sellers'),
        ('buyers', 'All Buyers'),
        ('verified_sellers', 'Verified Sellers'),
        ('unverified_sellers', 'Unverified Sellers'),
        ('premium_users', 'Premium Subscribers'),
        ('specific_users', 'Specific Users'),
    ]
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='notification')
    target_audience = models.CharField(max_length=20, choices=TARGET_CHOICES)
    specific_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.target_audience}"