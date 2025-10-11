from django.utils import timezone
from .models import Subscription

class SubscriptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            subscription = Subscription.objects.filter(
                user=request.user,
                status='active',
                end_date__gt=timezone.now()
            ).first()
            
            request.user.current_subscription = subscription
            request.user.subscription_plan = subscription.plan if subscription else None
        
        response = self.get_response(request)
        return response