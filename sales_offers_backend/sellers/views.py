from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum
from .models import Seller, SubscriptionPlan
from .serializers import SellerSerializer, SubscriptionPlanSerializer
from deals.models import Deal

class SellerListView(generics.ListCreateAPIView):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_stats(request):
    try:
        seller = Seller.objects.get(user=request.user)
        total_offers = Deal.objects.filter(seller=seller).count()
        active_offers = Deal.objects.filter(seller=seller, is_active=True).count()
        
        return Response({
            'total_offers': total_offers,
            'active_offers': active_offers,
            'revenue': 0,
            'growth': 0
        })
    except Seller.DoesNotExist:
        return Response({
            'total_offers': 0,
            'active_offers': 0,
            'revenue': 0,
            'growth': 0
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_offers(request):
    try:
        seller = Seller.objects.get(user=request.user)
        offers = Deal.objects.filter(seller=seller)
        from deals.serializers import DealSerializer
        serializer = DealSerializer(offers, many=True)
        return Response(serializer.data)
    except Seller.DoesNotExist:
        return Response([])
