from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Deal, FeaturedContent
from sellers.models import Seller, Subscription
from .serializers import DealSerializer
from sellers.serializers import SellerSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_featured_deals(request):
    """Get all featured deals for admin management"""
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    featured = FeaturedContent.objects.filter(content_type='deal', is_active=True)
    deals_data = []
    
    for item in featured:
        try:
            deal = Deal.objects.get(id=item.object_id)
            deal_data = DealSerializer(deal).data
            deal_data['featured_priority'] = item.priority
            deal_data['featured_algorithm'] = item.algorithm
            deal_data['featured_expires'] = item.expires_at
            deals_data.append(deal_data)
        except Deal.DoesNotExist:
            continue
    
    return Response(deals_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_featured_sellers(request):
    """Get all featured sellers for admin management"""
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    featured = FeaturedContent.objects.filter(content_type='seller', is_active=True)
    sellers_data = []
    
    for item in featured:
        try:
            seller = Seller.objects.get(id=item.object_id)
            seller_data = SellerSerializer(seller).data
            seller_data['featured_priority'] = item.priority
            seller_data['featured_algorithm'] = item.algorithm
            seller_data['featured_expires'] = item.expires_at
            sellers_data.append(seller_data)
        except Seller.DoesNotExist:
            continue
    
    return Response(sellers_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_featured_deal(request):
    """Set a deal as featured"""
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    deal_id = request.data.get('deal_id')
    priority = request.data.get('priority', 0)
    algorithm = request.data.get('algorithm', 'manual')
    expires_at = request.data.get('expires_at')
    
    deal = get_object_or_404(Deal, id=deal_id)
    
    featured, created = FeaturedContent.objects.get_or_create(
        content_type='deal',
        object_id=deal_id,
        defaults={
            'algorithm': algorithm,
            'priority': priority,
            'expires_at': expires_at,
            'is_active': True
        }
    )
    
    if not created:
        featured.algorithm = algorithm
        featured.priority = priority
        featured.expires_at = expires_at
        featured.is_active = True
        featured.save()
    
    return Response({'message': 'Deal set as featured successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_featured_seller(request):
    """Set a seller as featured"""
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    seller_id = request.data.get('seller_id')
    priority = request.data.get('priority', 0)
    algorithm = request.data.get('algorithm', 'manual')
    expires_at = request.data.get('expires_at')
    
    seller = get_object_or_404(Seller, id=seller_id)
    
    featured, created = FeaturedContent.objects.get_or_create(
        content_type='seller',
        object_id=seller_id,
        defaults={
            'algorithm': algorithm,
            'priority': priority,
            'expires_at': expires_at,
            'is_active': True
        }
    )
    
    if not created:
        featured.algorithm = algorithm
        featured.priority = priority
        featured.expires_at = expires_at
        featured.is_active = True
        featured.save()
    
    return Response({'message': 'Seller set as featured successfully'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_featured(request, content_type, object_id):
    """Remove featured status"""
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        featured = FeaturedContent.objects.get(
            content_type=content_type,
            object_id=object_id
        )
        featured.delete()
        return Response({'message': 'Featured status removed successfully'})
    except FeaturedContent.DoesNotExist:
        return Response({'error': 'Featured content not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_featured_content(request):
    """Get featured content for public display with fallback algorithms"""
    deals_limit = int(request.GET.get('deals_limit', 6))
    sellers_limit = int(request.GET.get('sellers_limit', 8))
    
    # Get featured deals
    featured_deals = get_featured_deals_with_fallback(deals_limit)
    
    # Get featured sellers
    featured_sellers = get_featured_sellers_with_fallback(sellers_limit)
    
    return Response({
        'featured_deals': featured_deals,
        'featured_sellers': featured_sellers
    })

def get_featured_deals_with_fallback(limit=6):
    """Get featured deals with fallback algorithms"""
    try:
        # Get unique deals by ID to prevent duplicates
        deals = Deal.objects.filter(
            is_published=True,
            status='approved'
        ).select_related('seller').order_by('-id')[:limit]
        
        # Ensure unique deals by using a set to track IDs
        unique_deals = []
        seen_ids = set()
        
        for deal in deals:
            if deal.id not in seen_ids:
                unique_deals.append(DealSerializer(deal).data)
                seen_ids.add(deal.id)
                if len(unique_deals) >= limit:
                    break
        
        return unique_deals
    except Exception:
        return []

def get_featured_sellers_with_fallback(limit=8):
    """Get featured sellers with fallback algorithms"""
    sellers = []
    used_seller_ids = set()
    
    try:
        # 1. Manual featured sellers
        manual_featured = FeaturedContent.objects.filter(
            content_type='seller',
            algorithm='manual',
            is_active=True
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).order_by('-priority')[:limit//2]
        
        for item in manual_featured:
            try:
                if item.object_id not in used_seller_ids:
                    seller = Seller.objects.get(id=item.object_id)
                    sellers.append(SellerSerializer(seller).data)
                    used_seller_ids.add(item.object_id)
            except Seller.DoesNotExist:
                continue
    except Exception:
        pass
    
    remaining = limit - len(sellers)
    if remaining > 0:
        try:
            # 2. Recent sellers as fallback (exclude already used sellers)
            recent_sellers = Seller.objects.filter(
                deals__is_published=True,
                deals__status='approved'
            ).exclude(id__in=used_seller_ids).distinct().order_by('-created_at')[:remaining]
            
            for seller in recent_sellers:
                if len(sellers) < limit and seller.id not in used_seller_ids:
                    sellers.append(SellerSerializer(seller).data)
                    used_seller_ids.add(seller.id)
        except Exception:
            pass
    
    return sellers