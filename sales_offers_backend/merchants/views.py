from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from deals.models import Voucher, VoucherRedemption
from sellers.models import Seller

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_voucher(request):
    """Merchant endpoint to redeem voucher"""
    try:
        voucher_code = request.data.get('voucher_code')
        
        # Verify merchant owns this business
        try:
            merchant = Seller.objects.get(user=request.user)
        except Seller.DoesNotExist:
            return Response({'error': 'Not authorized as merchant'}, status=403)
        
        # Find voucher
        try:
            voucher = Voucher.objects.get(code=voucher_code, deal__seller=merchant)
        except Voucher.DoesNotExist:
            return Response({'error': 'Voucher not found or not for your business'}, status=404)
        
        # Check voucher status
        if voucher.status != 'paid':
            return Response({'error': f'Voucher status is {voucher.status}, cannot redeem'}, status=400)
        
        if voucher.expires_at < timezone.now():
            voucher.status = 'expired'
            voucher.save()
            return Response({'error': 'Voucher has expired'}, status=400)
        
        if hasattr(voucher, 'redemption'):
            return Response({'error': 'Voucher already redeemed'}, status=400)
        
        # Redeem voucher
        voucher.status = 'redeemed'
        voucher.redeemed_at = timezone.now()
        voucher.save()
        
        # Create redemption record
        VoucherRedemption.objects.create(
            voucher=voucher,
            redeemed_by=request.user,
            notes=request.data.get('notes', '')
        )
        
        return Response({
            'success': True,
            'message': 'Voucher redeemed successfully',
            'voucher': {
                'code': voucher.code,
                'deal_title': voucher.deal.title,
                'quantity': voucher.quantity,
                'customer_email': voucher.customer.email,
                'redeemed_at': voucher.redeemed_at
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_voucher(request):
    """Verify voucher without redeeming"""
    try:
        voucher_code = request.data.get('voucher_code')
        
        # Verify merchant
        try:
            merchant = Seller.objects.get(user=request.user)
        except Seller.DoesNotExist:
            return Response({'error': 'Not authorized as merchant'}, status=403)
        
        # Find voucher
        try:
            voucher = Voucher.objects.get(code=voucher_code, deal__seller=merchant)
        except Voucher.DoesNotExist:
            return Response({'valid': False, 'error': 'Voucher not found'}, status=200)
        
        # Check status
        is_valid = (
            voucher.status == 'paid' and 
            voucher.expires_at > timezone.now() and
            not hasattr(voucher, 'redemption')
        )
        
        return Response({
            'valid': is_valid,
            'deal_title': voucher.deal.title,
            'amount': voucher.total_amount,
            'customer': voucher.customer.email,
            'expires_at': voucher.expires_at,
            'status': voucher.status,
            'already_redeemed': hasattr(voucher, 'redemption')
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def merchant_analytics(request):
    """Get merchant sales analytics"""
    try:
        merchant = Seller.objects.get(user=request.user)
        
        # Get voucher statistics
        total_vouchers = Voucher.objects.filter(deal__seller=merchant, status__in=['paid', 'redeemed']).count()
        redeemed_vouchers = Voucher.objects.filter(deal__seller=merchant, status='redeemed').count()
        total_revenue = sum(v.total_amount for v in Voucher.objects.filter(deal__seller=merchant, status__in=['paid', 'redeemed']))
        
        return Response({
            'total_vouchers': total_vouchers,
            'vouchers_redeemed': redeemed_vouchers,
            'total_revenue': float(total_revenue),
            'redemption_rate': (redeemed_vouchers / total_vouchers * 100) if total_vouchers > 0 else 0
        })
        
    except Seller.DoesNotExist:
        return Response({'error': 'Merchant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def voucher_history(request):
    """Get voucher redemption history for merchant"""
    try:
        merchant = Seller.objects.get(user=request.user)
        
        # Get redemptions for this merchant's deals
        redemptions = VoucherRedemption.objects.filter(
            voucher__deal__seller=merchant
        ).select_related('voucher', 'voucher__deal', 'voucher__customer').order_by('-redeemed_at')
        
        history = []
        for redemption in redemptions:
            history.append({
                'id': redemption.id,
                'voucher_code': redemption.voucher.code,
                'deal_title': redemption.voucher.deal.title,
                'customer_name': f"{redemption.voucher.customer.first_name} {redemption.voucher.customer.last_name}",
                'amount': float(redemption.voucher.total_amount),
                'redeemed_at': redemption.redeemed_at
            })
        
        return Response(history)
        
    except Seller.DoesNotExist:
        return Response({'error': 'Merchant profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)