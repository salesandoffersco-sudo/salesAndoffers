from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta
# from deals.models import Voucher  # Commented out for affiliate platform
# from payments.models import MerchantPayout  # Commented out for affiliate platform
from .models import Seller
import requests
from django.conf import settings

# Seller balance functionality commented out for affiliate platform
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def seller_balance(request):
#     """Get seller's available balance for withdrawal"""
#     return Response({'message': 'Withdrawal functionality not available in affiliate platform'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_balance(request):
    """Affiliate platform - no withdrawal functionality"""
    return Response({
        'message': 'This is an affiliate platform - no direct payments processed',
        'total_clicks': 0,  # Future: implement click tracking analytics
        'active_ads': 0,    # Future: count active advertisements
        'currency': 'N/A'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_withdrawal(request):
    """Affiliate platform - no withdrawal functionality"""
    return Response({
        'error': 'This is an affiliate platform - no direct payments processed. Revenue is generated through external store partnerships.'
    }, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def withdrawal_history(request):
    """Affiliate platform - no withdrawal history"""
    return Response({
        'message': 'This is an affiliate platform - no direct payments processed',
        'history': []
    })

@api_view(['GET'])
def bank_list(request):
    """Affiliate platform - no bank functionality needed"""
    return Response({
        'message': 'This is an affiliate platform - no direct banking required',
        'banks': []
    })