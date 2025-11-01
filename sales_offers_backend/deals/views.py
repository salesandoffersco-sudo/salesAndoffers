from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Deal, Voucher, DealImage
from .serializers import DealSerializer, VoucherSerializer, DealImageSerializer
from sellers.models import Seller
from sellers.serializers import SellerSerializer
from accounts.models import User
from accounts.notification_service import NotificationService

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_deals(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=403)
    
    deals = Deal.objects.select_related('seller').all().order_by('-created_at')
    serializer = DealSerializer(deals, many=True)
    return Response(serializer.data)

class DealListView(generics.ListCreateAPIView):
    serializer_class = DealSerializer
    
    def get_queryset(self):
        # Show deals but filter based on seller profile status
        return Deal.objects.filter(
            status='approved',
            seller__profile__is_published=True,
            is_active=True
        ).select_related('seller__profile')
    
    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        
        # Get seller for current user
        try:
            seller = Seller.objects.get(user=self.request.user)
            # Check if seller profile exists and is published
            if hasattr(seller, 'profile'):
                if not seller.profile.is_published:
                    raise ValidationError({
                        'error': 'You must publish your seller profile before creating offers.',
                        'action_required': 'setup_profile',
                        'redirect_url': '/seller/profile'
                    })
            else:
                # Create default profile if it doesn't exist
                from sellers.models import SellerProfile
                SellerProfile.objects.create(
                    seller=seller, 
                    company_name=seller.business_name,
                    description=seller.business_description,
                    phone=seller.phone or '',
                    email=seller.email or seller.user.email,
                    address=seller.address,
                    is_published=False
                )
                raise ValidationError({
                    'error': 'You must publish your seller profile before creating offers.',
                    'action_required': 'setup_profile',
                    'redirect_url': '/seller/profile'
                })
        except Seller.DoesNotExist:
            raise ValidationError({'error': 'You must have a seller profile to create deals.'})
        
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
                        raise ValidationError({'error': f'You have reached your plan limit of {max_offers} offers. Upgrade your plan to create more.'})
                else:
                    # No subscription - limit to 1 offer
                    current_offers = Deal.objects.filter(seller=seller, is_active=True).count()
                    if current_offers >= 1:
                        raise ValidationError({'error': 'Subscribe to a plan to create more offers.'})
            except Exception as e:
                # If subscription check fails, allow creation but log the error
                pass
        
        deal = serializer.save(seller=seller, status='approved')  # Auto-approve deals
        
        # Notify users about new offer (with error handling)
        try:
            recent_users = User.objects.filter(is_active=True, last_login__isnull=False)[:50]
            NotificationService.create_offer_notification(recent_users, deal)
        except Exception:
            # Continue even if notification fails
            pass

class DealDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DealSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            # For authenticated users, allow access to their own deals even if inactive
            try:
                seller = Seller.objects.get(user=self.request.user)
                return Deal.objects.filter(seller=seller)
            except Seller.DoesNotExist:
                pass
        # For public access, only show active approved deals
        return Deal.objects.filter(is_active=True, status='approved')
    
    def perform_update(self, serializer):
        # Only allow sellers to update their own deals
        deal = self.get_object()
        try:
            seller = Seller.objects.get(user=self.request.user)
            if deal.seller != seller:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only update your own deals")
        except Seller.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be a seller to update deals")
        
        serializer.save()

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_deal_image(request, deal_id):
    """Upload image for a deal"""
    try:
        seller = Seller.objects.get(user=request.user)
        deal = Deal.objects.get(id=deal_id, seller=seller)
        
        image_url = request.data.get('image_url')
        is_main = request.data.get('is_main', False)
        alt_text = request.data.get('alt_text', '')
        
        if not image_url:
            return Response({'error': 'image_url is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If setting as main image, unset other main images
        if is_main:
            DealImage.objects.filter(deal=deal, is_main=True).update(is_main=False)
            deal.main_image = image_url
            deal.save()
        
        # Get next order number
        last_image = DealImage.objects.filter(deal=deal).order_by('-order').first()
        order = (last_image.order + 1) if last_image else 0
        
        deal_image = DealImage.objects.create(
            deal=deal,
            image_url=image_url,
            is_main=is_main,
            order=order,
            alt_text=alt_text
        )
        
        serializer = DealImageSerializer(deal_image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except (Seller.DoesNotExist, Deal.DoesNotExist):
        return Response({'error': 'Deal not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_deal_image(request, deal_id, image_id):
    """Delete a deal image"""
    try:
        seller = Seller.objects.get(user=request.user)
        deal = Deal.objects.get(id=deal_id, seller=seller)
        image = DealImage.objects.get(id=image_id, deal=deal)
        
        # If deleting main image, clear main_image field
        if image.is_main:
            deal.main_image = None
            deal.save()
        
        image.delete()
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
        
    except (Seller.DoesNotExist, Deal.DoesNotExist, DealImage.DoesNotExist):
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_deal_image(request, deal_id, image_id):
    """Update deal image (set as main, reorder, etc.)"""
    try:
        seller = Seller.objects.get(user=request.user)
        deal = Deal.objects.get(id=deal_id, seller=seller)
        image = DealImage.objects.get(id=image_id, deal=deal)
        
        is_main = request.data.get('is_main')
        order = request.data.get('order')
        alt_text = request.data.get('alt_text')
        
        if is_main is not None:
            if is_main:
                # Unset other main images
                DealImage.objects.filter(deal=deal, is_main=True).update(is_main=False)
                deal.main_image = image.image_url
                deal.save()
            image.is_main = is_main
        
        if order is not None:
            image.order = order
        
        if alt_text is not None:
            image.alt_text = alt_text
        
        image.save()
        
        serializer = DealImageSerializer(image)
        return Response(serializer.data)
        
    except (Seller.DoesNotExist, Deal.DoesNotExist, DealImage.DoesNotExist):
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
