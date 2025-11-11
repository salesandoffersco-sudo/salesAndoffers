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
import json
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
        active_offers = Deal.objects.filter(seller=seller, is_published=True).count()
        
        # Calculate affiliate metrics (mock data for now)
        total_clicks = Deal.objects.filter(seller=seller).count() * 25  # Mock: 25 clicks per deal
        monthly_clicks = Deal.objects.filter(seller=seller, is_published=True).count() * 8  # Mock: 8 clicks per month per active deal
        
        # Estimated commission (mock calculation - would be real in production)
        estimated_commission = total_clicks * 0.05  # 5 cents per click
        
        # Get active subscription info
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()
        
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
            'total_clicks': total_clicks,
            'monthly_clicks': monthly_clicks,
            'estimated_commission': estimated_commission,
            'click_growth': 15.2,  # Mock growth percentage
            'subscription': plan_info
        })
    except Seller.DoesNotExist:
        return Response({
            'total_offers': 0,
            'active_offers': 0,
            'total_clicks': 0,
            'monthly_clicks': 0,
            'estimated_commission': 0,
            'click_growth': 0,
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
            offers = Deal.objects.filter(seller=seller, is_published=True)
            from deals.serializers import DealSerializer
            serializer = DealSerializer(offers, many=True)
            return Response(serializer.data)
        except Seller.DoesNotExist:
            return Response({'error': 'Seller not found'}, status=404)
    else:
        # Authenticated seller's own offers
        try:
            seller = Seller.objects.get(user=request.user)
            offers = Deal.objects.filter(seller=seller).order_by('-created_at')
            from deals.serializers import DealSerializer
            serializer = DealSerializer(offers, many=True)
            return Response(serializer.data)
        except Seller.DoesNotExist:
            return Response([])

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_seller_offer(request, offer_id):
    try:
        seller = Seller.objects.get(user=request.user)
        offer = Deal.objects.get(id=offer_id, seller=seller)
        
        if request.method == 'PATCH':
            # Update offer (toggle published status, etc.)
            is_published = request.data.get('is_published')
            if is_published is not None:
                offer.is_published = is_published
                offer.save()
            
            from deals.serializers import DealSerializer
            serializer = DealSerializer(offer)
            return Response(serializer.data)
            
        elif request.method == 'DELETE':
            # Delete offer
            offer.delete()
            return Response({'message': 'Offer deleted successfully'})
            
    except Seller.DoesNotExist:
        return Response({'error': 'Seller profile not found'}, status=404)
    except Deal.DoesNotExist:
        return Response({'error': 'Offer not found or not owned by you'}, status=404)

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
            if plan.paystack_plan_code:
                # Use hosted Paystack page with reference parameter
                payment_url = f"https://paystack.shop/pay/{plan.paystack_plan_code}?email={request.user.email}&reference={payment_reference}"
                
                return Response({
                    'payment_url': payment_url,
                    'reference': payment_reference,
                    'subscription_id': subscription.id,
                    'is_subscription': billing_type == 'auto'
                })
            else:
                return Response({'error': f'Payment page not configured for {plan.name} plan. Please contact support.'}, status=400)
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
    # Try to get existing seller first
    try:
        seller = Seller.objects.get(user=request.user)
    except Seller.DoesNotExist:
        # Only create if doesn't exist
        seller = Seller.objects.create(
            user=request.user,
            business_name=f"{request.user.username}'s Business",
            business_description='New business on Sales & Offers',
            address='Not specified',
            phone='',
            email=request.user.email
        )
    
    # Try to get existing profile first
    try:
        profile = SellerProfile.objects.get(seller=seller)
    except SellerProfile.DoesNotExist:
        # Only create if doesn't exist
        profile = SellerProfile.objects.create(
            seller=seller,
            company_name=seller.business_name,
            description=seller.business_description,
            phone=seller.phone or '',
            email=seller.email or request.user.email,
            address=seller.address,
            is_published=True
        )
    
    if request.method == 'GET':
        serializer = SellerProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method in ['POST', 'PUT']:
        serializer = SellerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_sellers(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    sellers = Seller.objects.select_related('user').all().order_by('-created_at')
    serializer = SellerSerializer(sellers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_subscriptions(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    subscriptions = Subscription.objects.select_related('user', 'plan').all().order_by('-created_at')
    serializer = SubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payments(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    payments = Payment.objects.select_related('user', 'subscription__plan').all().order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_profile_publish(request):
    # Try to get existing seller first
    try:
        seller = Seller.objects.get(user=request.user)
    except Seller.DoesNotExist:
        seller = Seller.objects.create(
            user=request.user,
            business_name=f"{request.user.username}'s Business",
            business_description='New business on Sales & Offers',
            address='Not specified',
            phone='',
            email=request.user.email
        )
    
    # Try to get existing profile first
    try:
        profile = SellerProfile.objects.get(seller=seller)
    except SellerProfile.DoesNotExist:
        profile = SellerProfile.objects.create(
            seller=seller,
            company_name=seller.business_name,
            description=seller.business_description,
            phone=seller.phone or '',
            email=seller.email or request.user.email,
            address=seller.address,
            is_published=True  # Default to published instead of False
        )
    
    # Only allow explicit publish/unpublish actions, no automatic toggling
    action = request.data.get('action')
    if action == 'publish':
        profile.is_published = True
        profile.save()
    elif action == 'unpublish':
        profile.is_published = False
        profile.save()
    else:
        # If no explicit action, just return current status without changing
        pass
    
    return Response({'is_published': profile.is_published})
