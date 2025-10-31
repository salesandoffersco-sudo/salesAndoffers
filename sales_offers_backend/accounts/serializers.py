from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Favorite, Notification
from deals.serializers import DealSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'is_seller', 'is_buyer')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                data['user'] = user
                return data
            raise serializers.ValidationError('Invalid credentials')
        raise serializers.ValidationError('Must include username and password')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'phone', 'address', 'is_seller', 'is_buyer', 'profile_picture', 'google_picture', 'is_google_user', 'is_staff', 'is_superuser')
        read_only_fields = ('id',)

class FavoriteSerializer(serializers.ModelSerializer):
    offer = DealSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ('id', 'offer', 'created_at')
        read_only_fields = ('id', 'created_at')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'type', 'is_read', 'related_offer_id', 'created_at')
        read_only_fields = ('id', 'created_at')