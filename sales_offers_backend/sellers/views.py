from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from .models import Seller, SubscriptionPlan, Subscription, Payment, SellerProfile
from .serializers import SellerSerializer, SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer, SellerProfileSerializer
from deals.models import Deal
from accounts.models import User
import uuid
import requests
from django.conf import settings

class SellerListView(generics.ListCreateAPIView):
    serializer_class = SellerSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Seller.objects.select_related('user').filter(
            profile__is_published=True
        ).annotate(
            total_deals=Count('deals'),
            avg_rating=Avg('deals__rating') or 4.5
        )
        
        # Apply filters
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                business_name__icontains=search
            )
        
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(avg_rating__gte=float(rating))
            
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(address__icontains=location)
            
        return queryset

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
    except SubscriptionPlan.DoesNotExist:
        return Response({'error': f'Subscription plan with ID {plan_id} not found'}, status=404)
    
    try:
        
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
        
        # Get billing preference from request
        billing_type = request.data.get('billing_type', 'manual')  # 'auto' or 'manual'
        
        # Use Paystack hosted payment pages
        if plan.price_ksh > 0:
            # Map plan names to Paystack hosted page URLs
            plan_urls = {
                'Pro': settings.PAYSTACK_PRO_PLAN_URL,
                'Enterprise': settings.PAYSTACK_ENTERPRISE_PLAN_URL
            }
            
            if plan.name in plan_urls and plan_urls[plan.name]:
                # Use hosted Paystack page
                payment_url = f"{plan_urls[plan.name]}?email={request.user.email}&reference={payment_reference}"
                
                return Response({
                    'payment_url': payment_url,
                    'reference': payment_reference,
                    'subscription_id': subscription.id,
                    'is_subscription': billing_type == 'auto'
                })
            else:
                return Response({'error': f'Payment page not configured for {plan.name} plan'}, status=400)
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
    except Exception as e:
        return Response({'error': f'Subscription failed: {str(e)}'}, status=400)

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
                # Check if card is prepaid (reject prepaid cards)
                card_type = data['data'].get('authorization', {}).get('card_type', '')
                if card_type.lower() == 'prepaid':
                    payment.status = 'failed'
                    payment.save()
                    return Response({'error': 'Prepaid cards are not accepted. Please use a debit or credit card.'}, status=400)
                
                payment.status = 'completed'
                payment.save()
                
                subscription = payment.subscription
                subscription.status = 'active'
                subscription.payment_reference = reference
                
                # Store authorization code for auto-billing
                auth_code = data['data'].get('authorization', {}).get('authorization_code')
                if auth_code:
                    subscription.authorization_code = auth_code
                
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

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def seller_profile(request):
    try:
        seller = Seller.objects.get(user=request.user)
        profile, created = SellerProfile.objects.get_or_create(seller=seller)
        
        if request.method == 'GET':
            serializer = SellerProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method in ['POST', 'PUT']:
            serializer = SellerProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
            
    except Seller.DoesNotExist:
        return Response({'error': 'Seller not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_profile_publish(request):
    try:
        seller = Seller.objects.get(user=request.user)
        profile = SellerProfile.objects.get(seller=seller)
        profile.is_published = not profile.is_published
        profile.save()
        return Response({'is_published': profile.is_published})
    except (Seller.DoesNotExist, SellerProfile.DoesNotExist):
        return Response({'error': 'Profile not found'}, status=404)
