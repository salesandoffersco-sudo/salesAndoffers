from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    full_path = serializers.CharField(source='get_full_path', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'level', 'full_path', 'is_active']