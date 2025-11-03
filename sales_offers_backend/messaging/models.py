from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        participant_names = ', '.join([user.username for user in self.participants.all()])
        return f"Conversation: {participant_names}"
    
    @property
    def last_message(self):
        return self.messages.first()

class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('file', 'File'),
        ('offer', 'Offer'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    attachment_data = models.JSONField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_expired = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    def is_attachment_expired(self):
        if not self.expires_at or self.message_type == 'text':
            return False
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def get_file_expiration_hours(self):
        # Default 24 hours - can be customized based on sender's subscription
        return 24
    
    def save(self, *args, **kwargs):
        # Set expiration for file attachments
        if self.message_type in ['file'] and not self.expires_at:
            from django.utils import timezone
            from datetime import timedelta
            hours = self.get_file_expiration_hours()
            self.expires_at = timezone.now() + timedelta(hours=hours)
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."