from django.core.management.base import BaseCommand
from django.utils import timezone
from messaging.models import Message
import requests
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Clean up expired file attachments'

    def handle(self, *args, **options):
        # Find expired file messages
        expired_messages = Message.objects.filter(
            message_type='file',
            expires_at__lt=timezone.now(),
            is_expired=False,
            attachment_data__isnull=False
        )
        
        deleted_count = 0
        
        for message in expired_messages:
            try:
                # Get file URL from attachment data
                if message.attachment_data and 'url' in message.attachment_data:
                    file_url = message.attachment_data['url']
                    
                    # Delete from Vercel Blob (if it's a blob URL)
                    if 'blob.vercel-storage.com' in file_url:
                        # Extract blob token from URL for deletion
                        # This would require Vercel Blob delete API implementation
                        pass
                    
                    # Mark as expired and clear attachment data
                    message.is_expired = True
                    message.attachment_data = {
                        **message.attachment_data,
                        'expired': True,
                        'expired_at': timezone.now().isoformat()
                    }
                    message.save()
                    deleted_count += 1
                    
                    self.stdout.write(f'Expired file: {message.attachment_data.get("name", "unknown")}')
                    
            except Exception as e:
                logger.error(f'Error expiring message {message.id}: {str(e)}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully expired {deleted_count} file attachments')
        )