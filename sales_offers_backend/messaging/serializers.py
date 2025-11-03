from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture', 'is_online', 'is_seller']
    
    def get_profile_picture(self, obj):
        if hasattr(obj, 'sellerprofile') and obj.sellerprofile.company_logo:
            return obj.sellerprofile.company_logo
        return obj.profile_picture
    
    def get_is_online(self, obj):
        # Simple online status - can be enhanced with real-time tracking
        return True

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    is_attachment_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'message_type', 'attachment_data', 'expires_at', 'is_expired', 'is_attachment_expired', 'timestamp', 'is_read']
    
    def get_is_attachment_expired(self, obj):
        return obj.is_attachment_expired()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Hide attachment data if expired
        if instance.is_attachment_expired():
            data['attachment_data'] = {
                'expired': True,
                'message': 'This file has expired and is no longer available',
                'type': instance.attachment_data.get('type') if instance.attachment_data else 'file'
            }
        return data

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'unread_count', 'other_participant', 'created_at', 'updated_at']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0
    
    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user:
            other_participants = obj.participants.exclude(id=request.user.id)
            if other_participants.exists():
                return UserSerializer(other_participants.first()).data
        return None