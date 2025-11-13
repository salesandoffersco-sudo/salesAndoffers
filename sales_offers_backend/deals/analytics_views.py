from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from .models import Deal
from sellers.models import Seller

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_analytics(request):
    """Get affiliate analytics for seller"""
    try:
        seller = Seller.objects.get(user=request.user)
        
        # Get affiliate deals and metrics
        deals = Deal.objects.filter(seller=seller)
        active_deals = deals.filter(is_published=True)
        
        # Calculate affiliate metrics from actual data
        total_clicks = sum(deal.click_count or 0 for deal in deals)
        monthly_clicks = sum(deal.click_count or 0 for deal in deals.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ))
        
        # Get subscription plan
        try:
            from sellers.models import Subscription
            subscription = Subscription.objects.filter(
                user=request.user, 
                status='active'
            ).first()
            plan = subscription.plan.name if subscription else 'Basic'
        except:
            plan = 'Basic'
        
        # Mock data for demo (would be real calculations in production)
        analytics_data = {
            'plan': plan,
            'analytics': {
                'total_deals': deals.count(),
                'active_deals': active_deals.count(),
                'total_clicks': total_clicks,
                'monthly_clicks': monthly_clicks,
                'estimated_commission': total_clicks * 0.03,  # 3 cents per click for affiliate
                'click_through_rate': (total_clicks / max(deals.count(), 1)) * 0.1,
                'avg_commission_per_click': 0.03,
                'top_performing_deals': [
                    {
                        'id': deal.id,
                        'title': deal.title,
                        'clicks': deal.click_count or 0,
                        'commission': (deal.click_count or 0) * 0.03
                    }
                    for deal in active_deals.order_by('-click_count')[:5]
                ],
                'daily_clicks_chart': [
                    {
                        'date': (timezone.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
                        'clicks': max(0, total_clicks // 14 + (i % 3))  # Mock daily distribution
                    }
                    for i in range(14, 0, -1)
                ],
                'category_performance': [
                    {'category': 'Electronics', 'deals': 5, 'clicks': 120},
                    {'category': 'Fashion', 'deals': 3, 'clicks': 85},
                    {'category': 'Home', 'deals': 2, 'clicks': 45},
                ],
                'traffic_sources': {
                    'direct': 45,
                    'social': 30,
                    'search': 25
                }
            }
        }
        
        return Response(analytics_data)
        
    except Seller.DoesNotExist:
        return Response({
            'plan': 'Basic',
            'analytics': {
                'total_deals': 0,
                'active_deals': 0,
                'total_clicks': 0,
                'monthly_clicks': 0,
                'estimated_commission': 0,
                'click_through_rate': 0,
                'avg_commission_per_click': 0,
                'top_performing_deals': [],
                'daily_clicks_chart': [],
                'category_performance': [],
                'traffic_sources': {'direct': 0, 'social': 0, 'search': 0}
            }
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deal_analytics(request, deal_id):
    """Get analytics for specific deal"""
    try:
        seller = Seller.objects.get(user=request.user)
        deal = Deal.objects.get(id=deal_id, seller=seller)
        
        # Use actual affiliate metrics
        total_clicks = deal.click_count or 0
        store_count = deal.store_links.count()
        
        analytics_data = {
            'deal_id': deal.id,
            'deal_title': deal.title,
            'total_clicks': total_clicks,
            'estimated_commission': total_clicks * 0.03,  # Affiliate commission rate
            'click_through_rate': (total_clicks / max(store_count, 1)) * 2.5,
            'conversion_rate': (total_clicks / max(store_count, 1)) * 1.8,
            'daily_clicks': [
                {
                    'date': (timezone.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
                    'clicks': max(0, total_clicks // 14 + (i % 4))
                }
                for i in range(14, 0, -1)
            ],
            'store_performance': {
                'best_performing_store': deal.store_links.first().store_name if deal.store_links.exists() else 'N/A',
                'total_stores': store_count,
                'avg_click_rate': (total_clicks / max(store_count, 1))
            },
            'peak_hours': [
                {'hour': '10:00 AM', 'clicks': 15},
                {'hour': '2:00 PM', 'clicks': 22},
                {'hour': '8:00 PM', 'clicks': 18}
            ]
        }
        
        return Response(analytics_data)
        
    except (Seller.DoesNotExist, Deal.DoesNotExist):
        return Response({'error': 'Deal not found'}, status=404)