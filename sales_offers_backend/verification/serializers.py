from rest_framework import serializers
from .models import VerificationRequest, Ticket, TicketMessage, AdminNotification
from accounts.serializers import UserSerializer
from sellers.serializers import SellerSerializer

class VerificationRequestSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    
    class Meta:
        model = VerificationRequest
        fields = '__all__'

class TicketMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TicketMessage
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    assigned_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Ticket
        fields = '__all__'

class AdminNotificationSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminNotification
        fields = '__all__'