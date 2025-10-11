from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Deal
from .serializers import DealSerializer
from sellers.models import Seller
from sellers.serializers import SellerSerializer
from accounts.models import User
from accounts.notification_service import NotificationService

class DealListView(generics.ListCreateAPIView):
    queryset = Deal.objects.filter(is_active=True)
    serializer_class = DealSerializer
    
    def perform_create(self, serializer):
        # Check subscription limits
        if self.request.user.is_authenticated:
            subscription = getattr(self.request.user, 'current_subscription', None)
            if subscription:
                current_offers = Deal.objects.filter(seller__user=self.request.user, is_active=True).count()
                max_offers = subscription.plan.max_offers
                
                if max_offers != -1 and current_offers >= max_offers:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError(f'You have reached your plan limit of {max_offers} offers. Upgrade your plan to create more.')
            else:
                # No subscription - limit to 1 offer
                current_offers = Deal.objects.filter(seller__user=self.request.user, is_active=True).count()
                if current_offers >= 1:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError('Subscribe to a plan to create more offers.')
        
        deal = serializer.save()
        # Notify users about new offer
        recent_users = User.objects.filter(is_active=True, last_login__isnull=False)[:50]
        NotificationService.create_offer_notification(recent_users, deal)

class DealDetailView(generics.RetrieveAPIView):
    queryset = Deal.objects.filter(is_active=True)
    serializer_class = DealSerializer

@api_view(['GET'])
def seller_detail(request, seller_id):
    try:
        seller = Seller.objects.get(id=seller_id)
        seller_data = SellerSerializer(seller).data
        return Response(seller_data)
    except Seller.DoesNotExist:
        return Response({'error': 'Seller not found'}, status=404)

@api_view(['GET'])
def seller_offers(request, seller_id):
    try:
        seller = Seller.objects.get(id=seller_id)
        offers = Deal.objects.filter(seller=seller, is_active=True)
        serializer = DealSerializer(offers, many=True)
        return Response(serializer.data)
    except Seller.DoesNotExist:
        return Response({'error': 'Seller not found'}, status=404)
