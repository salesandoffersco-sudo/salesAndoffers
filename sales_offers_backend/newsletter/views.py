from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import NewsletterSubscriber

@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe_newsletter(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={'is_active': True}
        )
        
        if not created:
            if subscriber.is_active:
                return Response({'message': 'You are already subscribed to our newsletter'})
            else:
                subscriber.is_active = True
                subscriber.save()
        
        # Send welcome email
        subject = 'Welcome to Sales & Offers Newsletter!'
        message = f'''
Hi there!

Thank you for subscribing to the Sales & Offers newsletter!

You'll now receive updates about:
- Latest deals and offers
- New sellers and products
- Platform updates and features

Stay tuned for amazing deals!

Best regards,
Sales & Offers Team
'''
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            # Don't fail subscription if email fails
            pass
        
        return Response({'message': 'Successfully subscribed to newsletter!'})
        
    except Exception as e:
        return Response({'error': 'Failed to subscribe'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)