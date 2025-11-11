from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
# from deals.models import Voucher, VoucherRedemption  # Commented out for affiliate platform
from sellers.models import Seller

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_voucher(request):
    """Affiliate platform - no voucher redemption"""
    return Response({
        'error': 'This is an affiliate platform - no vouchers to redeem. Users purchase directly from external stores.'
    }, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_voucher(request):
    """Affiliate platform - no voucher verification"""
    return Response({
        'valid': False,
        'error': 'This is an affiliate platform - no vouchers to verify'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def merchant_analytics(request):
    """Get merchant analytics - affiliate platform"""
    try:
        merchant = Seller.objects.get(user=request.user)
        from deals.models import Deal
        
        # Get click statistics instead of voucher stats
        deals = Deal.objects.filter(seller=merchant)
        total_deals = deals.count()
        total_clicks = sum(deal.click_count for deal in deals)
        active_deals = deals.filter(is_published=True).count()
        
        return Response({
            'total_advertisements': total_deals,
            'active_advertisements': active_deals,
            'total_clicks': total_clicks,
            'average_clicks_per_ad': (total_clicks / total_deals) if total_deals > 0 else 0
        })
        
    except Seller.DoesNotExist:
        return Response({'error': 'Merchant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def voucher_history(request):
    """Get click history for merchant - affiliate platform"""
    try:
        merchant = Seller.objects.get(user=request.user)
        # Mock click history since ClickTracking not implemented
        from deals.models import Deal
        deals = Deal.objects.filter(seller=merchant)[:10]
        
        history = []
        for i, deal in enumerate(deals):
            history.append({
                'id': i + 1,
                'deal_title': deal.title,
                'store_name': 'Amazon',  # Mock store
                'user_email': f'user{i}@example.com',  # Mock user
                'clicked_at': timezone.now(),
                'ip_address': f'192.168.1.{i + 1}'  # Mock IP
            })
        
        return Response(history)
        
    except Seller.DoesNotExist:
        return Response({'error': 'Merchant profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)