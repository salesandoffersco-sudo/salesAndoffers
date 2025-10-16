from rest_framework import serializers
from .models import Transaction
from deals.serializers import DealSerializer

class TransactionSerializer(serializers.ModelSerializer):
    deal = DealSerializer(read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'deal', 'quantity', 'total_amount', 'status', 'payment_reference', 'created_at']