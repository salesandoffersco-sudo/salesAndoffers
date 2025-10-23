from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json
import hmac
import hashlib
import requests
from deals.models import Deal, Voucher
from .models import Payment
from datetime import datetime, timedelta

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initialize_payment(request):
    """Initialize Paystack payment for voucher purchase"""
    try:
        deal_id = request.data.get('deal_id')
        quantity = int(request.data.get('quantity', 1))
        
        deal = Deal.objects.get(id=deal_id, status='approved', is_active=True)
        
        # Check availability
        if deal.vouchers_available < quantity:
            return Response({'error': 'Not enough vouchers available'}, status=400)
        
        # Check purchase limits
        if quantity < deal.min_purchase or quantity > deal.max_purchase:
            return Response({'error': f'Quantity must be between {deal.min_purchase} and {deal.max_purchase}'}, status=400)
        
        # Calculate total amount with 10% platform commission
        from decimal import Decimal
        subtotal = deal.discounted_price * quantity
        platform_commission = subtotal * Decimal('0.10')  # 10% commission
        total_amount = subtotal  # Customer pays full amount
        seller_amount = subtotal - platform_commission  # Seller gets 90%
        
        # Create voucher
        voucher = Voucher.objects.create(
            deal=deal,
            customer=request.user,
            quantity=quantity,
            total_amount=total_amount,
            expires_at=deal.redemption_deadline
        )
        
        # Update voucher with commission after creation
        voucher.seller_amount = seller_amount
        voucher.platform_commission = platform_commission
        voucher.save()
        
        # Initialize Paystack payment
        paystack_data = {
            'email': request.user.email,
            'amount': int(total_amount * 100),  # Convert to kobo
            'currency': 'KES',
            'reference': f"voucher_{voucher.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'callback_url': f"{settings.FRONTEND_URL}/payment/callback",
            'metadata': {
                'voucher_id': voucher.id,
                'deal_id': deal.id,
                'quantity': quantity
            }
        }
        
        headers = {
            'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            'https://api.paystack.co/transaction/initialize',
            json=paystack_data,
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Create payment record
            Payment.objects.create(
                voucher=voucher,
                customer=request.user,
                amount=total_amount,
                paystack_reference=paystack_data['reference'],
                paystack_access_code=data['data']['access_code']
            )
            
            return Response({
                'authorization_url': data['data']['authorization_url'],
                'access_code': data['data']['access_code'],
                'reference': paystack_data['reference'],
                'voucher_id': voucher.id
            })
        else:
            voucher.delete()
            return Response({'error': 'Payment initialization failed'}, status=400)
            
    except Deal.DoesNotExist:
        return Response({'error': 'Deal not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def paystack_webhook(request):
    """Handle Paystack webhook for payment confirmation"""
    try:
        # Verify webhook signature
        signature = request.headers.get('x-paystack-signature')
        body = request.body
        
        expected_signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
            body,
            hashlib.sha512
        ).hexdigest()
        
        if signature != expected_signature:
            return HttpResponse(status=400)
        
        event = json.loads(body)
        
        if event['event'] == 'charge.success':
            reference = event['data']['reference']
            
            try:
                payment = Payment.objects.get(paystack_reference=reference)
                voucher = payment.voucher
                
                # Update payment status
                payment.status = 'success'
                payment.save()
                
                # Update voucher status and generate QR code
                voucher.status = 'paid'
                voucher.payment_reference = reference
                voucher.save()  # This will trigger QR code generation
                
                return HttpResponse(status=200)
                
            except Payment.DoesNotExist:
                return HttpResponse(status=404)
        
        return HttpResponse(status=200)
        
    except Exception as e:
        return HttpResponse(status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify payment status"""
    try:
        reference = request.data.get('reference')
        
        headers = {
            'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}'
        }
        
        response = requests.get(
            f'https://api.paystack.co/transaction/verify/{reference}',
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data['data']['status'] == 'success':
                try:
                    payment = Payment.objects.get(paystack_reference=reference)
                    voucher = payment.voucher
                    
                    if payment.status != 'success':
                        payment.status = 'success'
                        payment.save()
                        
                        voucher.status = 'paid'
                        voucher.payment_reference = reference
                        voucher.save()
                    
                    return Response({
                        'status': 'success',
                        'voucher_id': voucher.id,
                        'voucher_code': voucher.code
                    })
                    
                except Payment.DoesNotExist:
                    return Response({'error': 'Payment not found'}, status=404)
            else:
                return Response({'error': 'Payment not successful'}, status=400)
        else:
            return Response({'error': 'Verification failed'}, status=400)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_vouchers(request):
    """Get user's vouchers"""
    vouchers = Voucher.objects.filter(customer=request.user).select_related('deal')
    
    voucher_data = []
    for voucher in vouchers:
        voucher_data.append({
            'id': voucher.id,
            'code': voucher.code,
            'deal_title': voucher.deal.title,
            'deal_image': voucher.deal.image,
            'quantity': voucher.quantity,
            'total_amount': voucher.total_amount,
            'status': voucher.status,
            'qr_code': voucher.qr_code,
            'purchased_at': voucher.purchased_at,
            'expires_at': voucher.expires_at,
            'redemption_instructions': voucher.deal.redemption_instructions
        })
    
    return Response(voucher_data)