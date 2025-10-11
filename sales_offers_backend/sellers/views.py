from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from .models import Seller, SubscriptionPlan, Subscription, Payment
from .serializers import SellerSerializer, SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer
from deals.models import Deal
import uuid
import requests
from django.conf import settings

class SellerListView(generics.ListCreateAPIView):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_stats(request):
    try:
        seller = Seller.objects.get(user=request.user)
        total_offers = Deal.objects.filter(seller=seller).count()
        active_offers = Deal.objects.filter(seller=seller, is_active=True).count()
        
        # Get subscription info
        subscription = getattr(request.user, 'current_subscription', None)
        if subscription:
            features = subscription.plan.features if isinstance(subscription.plan.features, dict) else {}
            plan_info = {
                'has_subscription': True,
                'plan_name': subscription.plan.name,
                'max_offers': subscription.plan.max_offers,
                'offers_remaining': max(0, (subscription.plan.max_offers - active_offers)) if subscription.plan.max_offers != -1 else 0,
                'can_create_offers': subscription.plan.max_offers == -1 or active_offers < subscription.plan.max_offers,
                'plan': {
                    'id': subscription.plan.id,
                    'name': subscription.plan.name,
                    'features': features
                }
            }
        else:
            plan_info = {
                'has_subscription': False,
                'plan_name': 'No Plan',
                'max_offers': 1,
                'offers_remaining': max(0, 1 - active_offers),
                'can_create_offers': active_offers < 1,
                'plan': None
            }
        
        return Response({
            'total_offers': total_offers,
            'active_offers': active_offers,
            'revenue': 0,
            'growth': 0,
            'subscription': plan_info
        })
    except Seller.DoesNotExist:
        return Response({
            'total_offers': 0,
            'active_offers': 0,
            'revenue': 0,
            'growth': 0,
            'subscription': {
                'has_subscription': False,
                'plan_name': 'No Plan',
                'max_offers': 1,
                'offers_remaining': 1,
                'can_create_offers': True,
                'plan': None
            }
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_offers(request, seller_id=None):
    if seller_id:
        # Public view of seller offers
        try:
            seller = Seller.objects.get(id=seller_id)
            offers = Deal.objects.filter(seller=seller, is_active=True)
            from deals.serializers import DealSerializer
            serializer = DealSerializer(offers, many=True)
            return Response(serializer.data)
        except Seller.DoesNotExist:
            return Response({'error': 'Seller not found'}, status=404)
    else:
        # Authenticated seller's own offers
        try:
            seller = Seller.objects.get(user=request.user)
            offers = Deal.objects.filter(seller=seller)
            from deals.serializers import DealSerializer
            serializer = DealSerializer(offers, many=True)
            return Response(serializer.data)
        except Seller.DoesNotExist:
            return Response([])

@api_view(['GET'])
def seller_detail(request, seller_id):
    try:
        seller = Seller.objects.get(id=seller_id)
        serializer = SellerSerializer(seller)
        return Response(serializer.data)
    except Seller.DoesNotExist:
        return Response({'error': 'Seller not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_to_plan(request, plan_id):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
        
        # Check if user already has an active subscription
        existing_sub = Subscription.objects.filter(
            user=request.user, 
            status='active',
            end_date__gt=timezone.now()
        ).first()
        
        if existing_sub:
            return Response({'error': 'You already have an active subscription'}, status=400)
        
        # Create subscription
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            status='pending'
        )
        
        # Create payment record
        payment_reference = str(uuid.uuid4())
        payment = Payment.objects.create(
            user=request.user,
            subscription=subscription,
            amount=plan.price_ksh,
            payment_reference=payment_reference
        )
        
        # Initialize Paystack payment
        if plan.price_ksh > 0:
            paystack_data = {
                'email': request.user.email,
                'amount': int(plan.price_ksh * 100),  # Paystack expects amount in kobo
                'reference': payment_reference,
                'callback_url': f"{settings.FRONTEND_URL}/subscription/callback"
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
                return Response({
                    'payment_url': data['data']['authorization_url'],
                    'reference': payment_reference,
                    'subscription_id': subscription.id
                })
            else:
                return Response({'error': 'Payment initialization failed'}, status=400)
        else:
            # Free plan - activate immediately
            subscription.status = 'active'
            subscription.save()
            payment.status = 'completed'
            payment.save()
            
            return Response({
                'message': 'Subscription activated successfully',
                'subscription_id': subscription.id
            })
            
    except SubscriptionPlan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    reference = request.data.get('reference')
    
    if not reference:
        return Response({'error': 'Payment reference required'}, status=400)
    
    try:
        payment = Payment.objects.get(payment_reference=reference, user=request.user)
        
        # Verify with Paystack
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
                payment.status = 'completed'
                payment.save()
                
                subscription = payment.subscription
                subscription.status = 'active'
                subscription.payment_reference = reference
                subscription.save()
                
                return Response({'message': 'Payment verified and subscription activated'})
            else:
                payment.status = 'failed'
                payment.save()
                return Response({'error': 'Payment verification failed'}, status=400)
        else:
            return Response({'error': 'Payment verification failed'}, status=400)
            
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_subscription(request):
    subscription = Subscription.objects.filter(
        user=request.user,
        status='active',
        end_date__gt=timezone.now()
    ).first()
    
    if subscription:
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)
    else:
        return Response({'message': 'No active subscription'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    subscription = Subscription.objects.filter(
        user=request.user,
        status='active'
    ).first()
    
    if subscription:
        subscription.status = 'cancelled'
        subscription.save()
        return Response({'message': 'Subscription cancelled successfully'})
    else:
        return Response({'error': 'No active subscription found'}, status=404)
