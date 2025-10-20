from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta
from deals.models import Voucher
from payments.models import MerchantPayout
from .models import Seller
import requests
from django.conf import settings

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_balance(request):
    """Get seller's available balance for withdrawal"""
    try:
        seller = Seller.objects.get(user=request.user)
        
        # Calculate total earnings from paid vouchers
        total_earnings = Voucher.objects.filter(
            deal__seller=seller,
            status__in=['paid', 'redeemed']
        ).aggregate(Sum('seller_amount'))['seller_amount__sum'] or 0
        
        # Calculate total withdrawn amount
        total_withdrawn = MerchantPayout.objects.filter(
            merchant=seller,
            status='completed'
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        # Calculate pending withdrawals
        pending_withdrawals = MerchantPayout.objects.filter(
            merchant=seller,
            status__in=['pending', 'processing']
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        available_balance = total_earnings - total_withdrawn - pending_withdrawals
        
        return Response({
            'total_earnings': float(total_earnings),
            'total_withdrawn': float(total_withdrawn),
            'pending_withdrawals': float(pending_withdrawals),
            'available_balance': float(available_balance),
            'currency': 'KES'
        })
        
    except Seller.DoesNotExist:
        return Response({'error': 'Seller profile not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_withdrawal(request):
    """Request withdrawal of available balance"""
    try:
        seller = Seller.objects.get(user=request.user)
        amount = float(request.data.get('amount', 0))
        bank_code = request.data.get('bank_code')
        account_number = request.data.get('account_number')
        account_name = request.data.get('account_name')
        
        if amount <= 0:
            return Response({'error': 'Invalid withdrawal amount'}, status=400)
        
        # Check available balance
        total_earnings = Voucher.objects.filter(
            deal__seller=seller,
            status__in=['paid', 'redeemed']
        ).aggregate(Sum('seller_amount'))['seller_amount__sum'] or 0
        
        total_withdrawn = MerchantPayout.objects.filter(
            merchant=seller,
            status='completed'
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        pending_withdrawals = MerchantPayout.objects.filter(
            merchant=seller,
            status__in=['pending', 'processing']
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        available_balance = total_earnings - total_withdrawn - pending_withdrawals
        
        if amount > available_balance:
            return Response({'error': 'Insufficient balance'}, status=400)
        
        # Calculate platform fee (2% withdrawal fee)
        withdrawal_fee = amount * 0.02
        net_amount = amount - withdrawal_fee
        
        # Create payout record
        payout = MerchantPayout.objects.create(
            merchant=seller,
            amount=amount,
            commission=withdrawal_fee,
            net_amount=net_amount,
            status='pending'
        )
        
        # Initialize Paystack transfer
        transfer_data = {
            'source': 'balance',
            'amount': int(net_amount * 100),  # Convert to kobo
            'recipient': {
                'type': 'nuban',
                'name': account_name,
                'account_number': account_number,
                'bank_code': bank_code,
                'currency': 'NGN'
            },
            'reason': f'Withdrawal for {seller.business_name}',
            'reference': f'withdrawal_{payout.id}_{timezone.now().strftime("%Y%m%d%H%M%S")}'
        }
        
        headers = {
            'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            'https://api.paystack.co/transfer',
            json=transfer_data,
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            payout.paystack_transfer_code = data['data']['transfer_code']
            payout.status = 'processing'
            payout.save()
            
            return Response({
                'message': 'Withdrawal request submitted successfully',
                'payout_id': payout.id,
                'net_amount': float(net_amount),
                'withdrawal_fee': float(withdrawal_fee)
            })
        else:
            payout.delete()
            return Response({'error': 'Withdrawal request failed'}, status=400)
            
    except Seller.DoesNotExist:
        return Response({'error': 'Seller profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def withdrawal_history(request):
    """Get seller's withdrawal history"""
    try:
        seller = Seller.objects.get(user=request.user)
        payouts = MerchantPayout.objects.filter(merchant=seller).order_by('-created_at')
        
        payout_data = []
        for payout in payouts:
            payout_data.append({
                'id': payout.id,
                'amount': float(payout.amount),
                'withdrawal_fee': float(payout.commission),
                'net_amount': float(payout.net_amount),
                'status': payout.status,
                'created_at': payout.created_at,
                'processed_at': payout.processed_at
            })
        
        return Response(payout_data)
        
    except Seller.DoesNotExist:
        return Response({'error': 'Seller profile not found'}, status=404)

@api_view(['GET'])
def bank_list(request):
    """Get list of supported banks for withdrawal"""
    headers = {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}'
    }
    
    response = requests.get(
        'https://api.paystack.co/bank',
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        banks = [{'name': bank['name'], 'code': bank['code']} for bank in data['data']]
        return Response(banks)
    else:
        return Response({'error': 'Failed to fetch bank list'}, status=500)