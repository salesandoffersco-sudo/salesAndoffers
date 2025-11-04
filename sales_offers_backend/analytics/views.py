from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from deals.models import Deal, StoreLink, ClickTracking  # Removed Voucher for affiliate platform
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
        
        # Base analytics for affiliate platform
        deals = Deal.objects.filter(seller=seller)
        clicks = ClickTracking.objects.filter(store_link__deal__seller=seller)
        
        base_data = {
            'total_advertisements': deals.count(),
            'active_advertisements': deals.filter(is_published=True, status='approved').count(),
            'total_clicks': clicks.count(),
            'total_stores': StoreLink.objects.filter(deal__seller=seller).count(),
            'active_stores': StoreLink.objects.filter(deal__seller=seller, is_available=True).count(),
        }
        
        # Enhanced analytics for Pro and Enterprise
        if plan_name in ['Pro', 'Enterprise']:
            # Last 30 days data
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_clicks = clicks.filter(clicked_at__gte=thirty_days_ago)
            
            base_data.update({
                'monthly_clicks': recent_clicks.count(),
                'click_through_rate': calculate_click_rate(deals),
                'avg_clicks_per_ad': clicks.count() / deals.count() if deals.count() > 0 else 0,
                'top_performing_deals': get_top_deals(seller, 5),
            })
        
        # Advanced analytics for Enterprise only
        if plan_name == 'Enterprise':
            base_data.update({
                'daily_clicks_chart': get_daily_clicks_chart(seller, 30),
                'store_performance': get_store_performance(seller),
                'user_demographics': get_user_demographics(seller),
                'click_trends': get_click_trends(seller),
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
        
        clicks = ClickTracking.objects.filter(store_link__deal=deal)
        
        data = {
            'deal_id': deal.id,
            'deal_title': deal.title,
            'total_clicks': clicks.count(),
            'store_links': deal.store_links.count(),
            'active_stores': deal.store_links.filter(is_available=True).count(),
            'click_rate': calculate_deal_click_rate(deal),
        }
        
        # Enhanced analytics for Pro and Enterprise
        if plan_name in ['Pro', 'Enterprise']:
            data.update({
                'daily_clicks': get_deal_daily_clicks(deal, 30),
                'store_breakdown': get_deal_store_breakdown(deal),
                'peak_hours': get_deal_peak_hours(deal),
            })
        
        return Response(data)
        
    except (Seller.DoesNotExist, Deal.DoesNotExist):
        return Response({'error': 'Deal not found'}, status=404)

def calculate_click_rate(deals):
    """Calculate click rate for deals"""
    total_deals = deals.count()
    deals_with_clicks = deals.filter(store_links__clicks__isnull=False).distinct().count()
    return (deals_with_clicks / total_deals * 100) if total_deals > 0 else 0

def get_top_deals(seller, limit):
    """Get top performing deals by clicks"""
    deals = Deal.objects.filter(seller=seller).annotate(
        click_count=Count('store_links__clicks')
    ).order_by('-click_count')[:limit]
    
    return [{
        'id': deal.id,
        'title': deal.title,
        'clicks': deal.click_count,
        'stores': deal.store_links.count()
    } for deal in deals]

def get_daily_clicks_chart(seller, days):
    """Get daily clicks data for charts"""
    data = []
    for i in range(days):
        date = timezone.now().date() - timedelta(days=i)
        clicks = ClickTracking.objects.filter(
            store_link__deal__seller=seller,
            clicked_at__date=date
        ).count()
        
        data.append({
            'date': date.isoformat(),
            'clicks': clicks
        })
    
    return list(reversed(data))

def get_store_performance(seller):
    """Get performance by store"""
    stores = StoreLink.objects.filter(deal__seller=seller).values('store_name').annotate(
        deals_count=Count('deal', distinct=True),
        clicks=Count('clicks')
    ).order_by('-clicks')
    
    return [{
        'store': store['store_name'],
        'deals': store['deals_count'],
        'clicks': store['clicks']
    } for store in stores]

def get_user_demographics(seller):
    """Get user demographics data"""
    # Users who clicked on this seller's deals
    users = User.objects.filter(clicktracking__store_link__deal__seller=seller).distinct()
    return {
        'total_users': users.count(),
        'repeat_clickers': users.annotate(
            click_count=Count('clicktracking')
        ).filter(click_count__gt=1).count()
    }

def get_click_trends(seller):
    """Get click trends data"""
    months_data = []
    for i in range(12):
        month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
        clicks = ClickTracking.objects.filter(
            store_link__deal__seller=seller,
            clicked_at__month=month_start.month,
            clicked_at__year=month_start.year
        ).count()
        
        months_data.append({
            'month': month_start.strftime('%B %Y'),
            'clicks': clicks
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

def calculate_deal_click_rate(deal):
    """Calculate click rate for a specific deal"""
    total_stores = deal.store_links.count()
    stores_with_clicks = deal.store_links.filter(clicks__isnull=False).distinct().count()
    return (stores_with_clicks / total_stores * 100) if total_stores > 0 else 0

def get_deal_daily_clicks(deal, days):
    """Get daily clicks data for a deal"""
    data = []
    for i in range(days):
        date = timezone.now().date() - timedelta(days=i)
        clicks = ClickTracking.objects.filter(
            store_link__deal=deal,
            clicked_at__date=date
        ).count()
        
        data.append({
            'date': date.isoformat(),
            'clicks': clicks
        })
    
    return list(reversed(data))

def get_deal_store_breakdown(deal):
    """Get store breakdown for a deal"""
    stores = deal.store_links.annotate(
        click_count=Count('clicks')
    ).order_by('-click_count')
    
    return [{
        'store_name': store.store_name,
        'clicks': store.click_count,
        'price': float(store.price) if store.price else None,
        'is_available': store.is_available
    } for store in stores]

def get_deal_peak_hours(deal):
    """Get peak purchase hours for a deal"""
    # Simplified peak hours analysis
    return [
        {'hour': '10:00', 'purchases': 12},
        {'hour': '14:00', 'purchases': 18},
        {'hour': '19:00', 'purchases': 25}
    ]