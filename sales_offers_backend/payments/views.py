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
# from deals.models import Deal, Voucher  # Commented out for affiliate platform
# from .models import Payment  # Commented out for affiliate platform
from datetime import datetime, timedelta

# Payment functionality commented out for affiliate platform
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initialize_payment(request):
    """Affiliate platform - no payment functionality"""
    return Response({
        'error': 'This is an affiliate platform - no direct payments processed. Users are redirected to external stores.'
    }, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def paystack_webhook(request):
    """Affiliate platform - no webhook needed"""
    return HttpResponse(status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Affiliate platform - no payment verification needed"""
    return Response({
        'error': 'This is an affiliate platform - no payments to verify'
    }, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_vouchers(request):
    """Affiliate platform - no vouchers, return favorites instead"""
    return Response({
        'message': 'This is an affiliate platform - check your favorites instead of vouchers',
        'vouchers': []
    })