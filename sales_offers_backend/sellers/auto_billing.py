import requests
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import Subscription, Payment
import uuid

def process_auto_renewals():
    """Process auto-renewals for subscriptions expiring in 3 days"""
    
    # Get subscriptions that expire in 3 days and have auto-billing enabled
    expiring_date = timezone.now() + timedelta(days=3)
    auto_subscriptions = Subscription.objects.filter(
        billing_type='auto',
        status='active',
        end_date__lte=expiring_date,
        authorization_code__isnull=False
    )
    
    for subscription in auto_subscriptions:
        try:
            # Create new payment record
            payment_reference = str(uuid.uuid4())
            payment = Payment.objects.create(
                user=subscription.user,
                subscription=subscription,
                amount=subscription.plan.price_ksh,
                payment_reference=payment_reference
            )
            
            # Charge the saved card using Paystack
            charge_data = {
                'authorization_code': subscription.authorization_code,
                'email': subscription.user.email,
                'amount': int(subscription.plan.price_ksh * 100),
                'reference': payment_reference,
                'metadata': {
                    'subscription_id': subscription.id,
                    'renewal': True
                }
            }
            
            headers = {
                'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                'https://api.paystack.co/transaction/charge_authorization',
                json=charge_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['data']['status'] == 'success':
                    # Payment successful - extend subscription
                    payment.status = 'completed'
                    payment.save()
                    
                    subscription.end_date = subscription.end_date + timedelta(days=subscription.plan.duration_days)
                    subscription.save()
                    
                    print(f"Auto-renewal successful for subscription {subscription.id}")
                else:
                    # Payment failed
                    payment.status = 'failed'
                    payment.save()
                    print(f"Auto-renewal failed for subscription {subscription.id}: {data.get('message', 'Unknown error')}")
            else:
                payment.status = 'failed'
                payment.save()
                print(f"Auto-renewal request failed for subscription {subscription.id}")
                
        except Exception as e:
            print(f"Error processing auto-renewal for subscription {subscription.id}: {str(e)}")

def validate_card_type(authorization_code):
    """Validate that the card is not prepaid"""
    
    headers = {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        f'https://api.paystack.co/customer/{authorization_code}',
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        card_type = data['data'].get('authorization', {}).get('card_type', '')
        return card_type.lower() != 'prepaid'
    
    return False