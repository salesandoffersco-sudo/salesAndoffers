from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from deals.models import Deal, Voucher
from sellers.models import Seller, Subscription
from blog.models import BlogPost
from accounts.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_analytics(request, seller_id=None):
    """Get seller analytics based on subscription plan"""
    try:
        if seller_id:
            seller = Seller.objects.get(id=seller_id, user=request.user)
        else:
            seller = Seller.objects.get(user=request.user)
        subscription = getattr(request.user, 'current_subscription', None)
        plan_name = subscription.plan.name if subscription else 'Basic'
        
        # Base analytics for all plans
        deals = Deal.objects.filter(seller=seller)
        vouchers = Voucher.objects.filter(deal__seller=seller)
        
        base_data = {
            'total_deals': deals.count(),
            'active_deals': deals.filter(is_active=True, status='approved').count(),
            'total_vouchers_sold': vouchers.filter(status__in=['paid', 'redeemed']).count(),
            'total_revenue': float(vouchers.filter(status__in=['paid', 'redeemed']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
            'vouchers_redeemed': vouchers.filter(status='redeemed').count(),
        }
        
        # Enhanced analytics for Pro and Enterprise
        if plan_name in ['Pro', 'Enterprise']:
            # Last 30 days data
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_vouchers = vouchers.filter(purchased_at__gte=thirty_days_ago)
            
            base_data.update({
                'monthly_revenue': float(recent_vouchers.filter(status__in=['paid', 'redeemed']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
                'monthly_vouchers': recent_vouchers.filter(status__in=['paid', 'redeemed']).count(),
                'conversion_rate': calculate_conversion_rate(deals),
                'avg_deal_value': float(vouchers.filter(status__in=['paid', 'redeemed']).aggregate(Avg('total_amount'))['total_amount__avg'] or 0),
                'top_performing_deals': get_top_deals(seller, 5),
            })
        
        # Advanced analytics for Enterprise only
        if plan_name == 'Enterprise':
            base_data.update({
                'daily_revenue_chart': get_daily_revenue_chart(seller, 30),
                'category_performance': get_category_performance(seller),
                'customer_demographics': get_customer_demographics(seller),
                'seasonal_trends': get_seasonal_trends(seller),
                'competitor_analysis': get_competitor_analysis(seller),
            })
        
        return Response({
            'plan': plan_name,
            'analytics': base_data
        })
        
    except Seller.DoesNotExist:
        return Response({'error': 'Seller profile not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deal_analytics(request, deal_id):
    """Get detailed analytics for a specific deal"""
    try:
        seller = Seller.objects.get(user=request.user)
        deal = Deal.objects.get(id=deal_id, seller=seller)
        subscription = getattr(request.user, 'current_subscription', None)
        plan_name = subscription.plan.name if subscription else 'Basic'
        
        vouchers = Voucher.objects.filter(deal=deal)
        
        data = {
            'deal_id': deal.id,
            'deal_title': deal.title,
            'total_vouchers': vouchers.filter(status__in=['paid', 'redeemed']).count(),
            'revenue': float(vouchers.filter(status__in=['paid', 'redeemed']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
            'redeemed': vouchers.filter(status='redeemed').count(),
            'redemption_rate': calculate_deal_redemption_rate(deal),
        }
        
        # Enhanced analytics for Pro and Enterprise
        if plan_name in ['Pro', 'Enterprise']:
            data.update({
                'daily_sales': get_deal_daily_sales(deal, 30),
                'customer_feedback': get_deal_feedback(deal),
                'peak_hours': get_deal_peak_hours(deal),
            })
        
        return Response(data)
        
    except (Seller.DoesNotExist, Deal.DoesNotExist):
        return Response({'error': 'Deal not found'}, status=404)

def calculate_conversion_rate(deals):
    """Calculate conversion rate from deal views to purchases"""
    # Simplified calculation - in real app, track views
    total_deals = deals.count()
    deals_with_sales = deals.filter(vouchers__status__in=['paid', 'redeemed']).distinct().count()
    return (deals_with_sales / total_deals * 100) if total_deals > 0 else 0

def get_top_deals(seller, limit):
    """Get top performing deals by revenue"""
    deals = Deal.objects.filter(seller=seller).annotate(
        revenue=Sum('vouchers__total_amount', filter=Q(vouchers__status__in=['paid', 'redeemed']))
    ).order_by('-revenue')[:limit]
    
    return [{
        'id': deal.id,
        'title': deal.title,
        'revenue': float(deal.revenue or 0),
        'vouchers_sold': deal.vouchers.filter(status__in=['paid', 'redeemed']).count()
    } for deal in deals]

def get_daily_revenue_chart(seller, days):
    """Get daily revenue data for charts"""
    data = []
    for i in range(days):
        date = timezone.now().date() - timedelta(days=i)
        revenue = Voucher.objects.filter(
            deal__seller=seller,
            purchased_at__date=date,
            status__in=['paid', 'redeemed']
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        data.append({
            'date': date.isoformat(),
            'revenue': float(revenue)
        })
    
    return list(reversed(data))

def get_category_performance(seller):
    """Get performance by deal category"""
    categories = Deal.objects.filter(seller=seller).values('category').annotate(
        deals_count=Count('id'),
        revenue=Sum('vouchers__total_amount', filter=Q(vouchers__status__in=['paid', 'redeemed']))
    ).order_by('-revenue')
    
    return [{
        'category': cat['category'],
        'deals': cat['deals_count'],
        'revenue': float(cat['revenue'] or 0)
    } for cat in categories]

def get_customer_demographics(seller):
    """Get customer demographics data"""
    # Simplified demographics - in real app, collect more user data
    customers = User.objects.filter(vouchers__deal__seller=seller).distinct()
    return {
        'total_customers': customers.count(),
        'repeat_customers': customers.filter(vouchers__deal__seller=seller).annotate(
            purchase_count=Count('vouchers')
        ).filter(purchase_count__gt=1).count()
    }

def get_seasonal_trends(seller):
    """Get seasonal trends data"""
    months_data = []
    for i in range(12):
        month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
        revenue = Voucher.objects.filter(
            deal__seller=seller,
            purchased_at__month=month_start.month,
            purchased_at__year=month_start.year,
            status__in=['paid', 'redeemed']
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        months_data.append({
            'month': month_start.strftime('%B %Y'),
            'revenue': float(revenue)
        })
    
    return list(reversed(months_data))

def get_competitor_analysis(seller):
    """Get competitor analysis data"""
    # Simplified competitor analysis
    same_category_sellers = Seller.objects.filter(
        deals__category__in=seller.deals.values_list('category', flat=True)
    ).exclude(id=seller.id).distinct()
    
    return {
        'competitors_count': same_category_sellers.count(),
        'market_position': 'Top 25%',  # Simplified
        'avg_discount': 25.5  # Simplified
    }

def calculate_deal_redemption_rate(deal):
    """Calculate redemption rate for a specific deal"""
    total_vouchers = deal.vouchers.filter(status__in=['paid', 'redeemed']).count()
    redeemed_vouchers = deal.vouchers.filter(status='redeemed').count()
    return (redeemed_vouchers / total_vouchers * 100) if total_vouchers > 0 else 0

def get_deal_daily_sales(deal, days):
    """Get daily sales data for a deal"""
    data = []
    for i in range(days):
        date = timezone.now().date() - timedelta(days=i)
        sales = deal.vouchers.filter(
            purchased_at__date=date,
            status__in=['paid', 'redeemed']
        ).count()
        
        data.append({
            'date': date.isoformat(),
            'sales': sales
        })
    
    return list(reversed(data))

def get_deal_feedback(deal):
    """Get customer feedback for a deal"""
    # Simplified feedback - in real app, implement rating system
    return {
        'average_rating': 4.2,
        'total_reviews': 15,
        'positive_feedback': 85
    }

def get_deal_peak_hours(deal):
    """Get peak purchase hours for a deal"""
    # Simplified peak hours analysis
    return [
        {'hour': '10:00', 'purchases': 12},
        {'hour': '14:00', 'purchases': 18},
        {'hour': '19:00', 'purchases': 25}
    ]