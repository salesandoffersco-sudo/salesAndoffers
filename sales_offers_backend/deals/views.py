from rest_framework import generics
from .models import Deal
from .serializers import DealSerializer

class DealListView(generics.ListCreateAPIView):
    queryset = Deal.objects.filter(is_active=True)
    serializer_class = DealSerializer
