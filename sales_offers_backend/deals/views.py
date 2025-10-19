from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Deal, Voucher
from .serializers import DealSerializer, VoucherSerializer
from sellers.models import Seller
from sellers.serializers import SellerSerializer
from accounts.models import User
from accounts.notification_service import NotificationService

class DealListView(generics.ListCreateAPIView):
    queryset = Deal.objects.filter(is_active=True, status='approved', seller__profile__is_published=True)
    serializer_class = DealSerializer
    
    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        
        # Get seller for current user
        try:
            seller = Seller.objects.get(user=self.request.user)
            # Check if seller profile exists and is published
            if hasattr(seller, 'profile'):
                if not seller.profile.is_published:
                    raise ValidationError('You must publish your seller profile before creating offers.')
            else:
                # Create default profile if it doesn't exist
                from sellers.models import SellerProfile
                SellerProfile.objects.create(seller=seller, is_published=False)
                raise ValidationError('You must publish your seller profile before creating offers.')
        except Seller.DoesNotExist:
            raise ValidationError('You must have a seller profile to create deals.')
        
        # Check subscription limits
        if self.request.user.is_authenticated:
            try:
                from sellers.models import Subscription
                subscription = Subscription.objects.filter(
                    user=self.request.user, 
                    status='active'
                ).first()
                
                if subscription:
                    current_offers = Deal.objects.filter(seller=seller, is_active=True).count()
                    max_offers = subscription.plan.max_offers
                    
                    if max_offers != -1 and current_offers >= max_offers:
                        raise ValidationError(f'You have reached your plan limit of {max_offers} offers. Upgrade your plan to create more.')
                else:
                    # No subscription - limit to 1 offer
                    current_offers = Deal.objects.filter(seller=seller, is_active=True).count()
                    if current_offers >= 1:
                        raise ValidationError('Subscribe to a plan to create more offers.')
            except Exception as e:
                # If subscription check fails, allow creation but log the error
                pass
        
        deal = serializer.save(seller=seller)
        
        # Notify users about new offer (with error handling)
        try:
            recent_users = User.objects.filter(is_active=True, last_login__isnull=False)[:50]
            NotificationService.create_offer_notification(recent_users, deal)
        except Exception:
            # Continue even if notification fails
            pass

class DealDetailView(generics.RetrieveAPIView):
    queryset = Deal.objects.filter(is_active=True, status='approved')
    serializer_class = DealSerializer

@api_view(['GET'])
def seller_detail(request, seller_id):
    try:
        seller = Seller.objects.get(id=seller_id)
        seller_data = SellerSerializer(seller).data
        return Response(seller_data)
    except Seller.DoesNotExist:
        return Response({'error': 'Seller not found'}, status=404)

@api_view(['GET'])
def seller_offers(request, seller_id):
    try:
        seller = Seller.objects.get(id=seller_id)
        offers = Deal.objects.filter(seller=seller, is_active=True, status='approved')
        serializer = DealSerializer(offers, many=True)
        return Response(serializer.data)
    except Seller.DoesNotExist:
        return Response({'error': 'Seller not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_deals(request):
    """Get current user's deals"""
    try:
        seller = Seller.objects.get(user=request.user)
        deals = Deal.objects.filter(seller=seller)
        serializer = DealSerializer(deals, many=True)
        return Response(serializer.data)
    except Seller.DoesNotExist:
        return Response({'error': 'Seller profile not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deal_analytics(request, deal_id):
    """Get analytics for a specific deal"""
    try:
        seller = Seller.objects.get(user=request.user)
        deal = Deal.objects.get(id=deal_id, seller=seller)
        
        vouchers = Voucher.objects.filter(deal=deal)
        analytics = {
            'total_vouchers': deal.max_vouchers,
            'vouchers_sold': deal.vouchers_sold,
            'vouchers_available': deal.vouchers_available,
            'vouchers_redeemed': vouchers.filter(status='redeemed').count(),
            'total_revenue': sum(v.total_amount for v in vouchers.filter(status__in=['paid', 'redeemed'])),
            'pending_vouchers': vouchers.filter(status='pending').count(),
        }
        
        return Response(analytics)
    except (Seller.DoesNotExist, Deal.DoesNotExist):
        return Response({'error': 'Deal not found'}, status=404)
