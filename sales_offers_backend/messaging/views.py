from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Max
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, UserSerializer

User = get_user_model()

class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).prefetch_related('participants', 'messages')

class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id, participants=self.request.user)
        # Mark messages as read
        conversation.messages.exclude(sender=self.request.user).update(is_read=True)
        return conversation.messages.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    conversation_id = request.data.get('conversation_id')
    recipient_id = request.data.get('recipient_id')
    content = request.data.get('content')
    
    if not content:
        return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get or create conversation
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id, participants=request.user)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    elif recipient_id:
        try:
            recipient = User.objects.get(id=recipient_id)
            # Check if conversation already exists
            conversation = Conversation.objects.filter(
                participants=request.user
            ).filter(
                participants=recipient
            ).first()
            
            if not conversation:
                conversation = Conversation.objects.create()
                conversation.participants.add(request.user, recipient)
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': 'Either conversation_id or recipient_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create message
    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        content=content
    )
    
    # Update conversation timestamp
    conversation.save()
    
    return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get('q', '')
    if len(query) < 2:
        return Response([], status=status.HTTP_200_OK)
    
    users = User.objects.filter(
        Q(username__icontains=query) | 
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query)
    ).exclude(id=request.user.id)[:10]
    
    return Response(UserSerializer(users, many=True).data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request):
    recipient_id = request.data.get('recipient_id')
    
    if not recipient_id:
        return Response({'error': 'Recipient ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        recipient = User.objects.get(id=recipient_id)
    except User.DoesNotExist:
        return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if conversation already exists
    conversation = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=recipient
    ).first()
    
    if not conversation:
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, recipient)
    
    return Response(ConversationSerializer(conversation, context={'request': request}).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request):
    conversation_id = request.data.get('conversation_id')
    
    if not conversation_id:
        return Response({'error': 'Conversation ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, participants=request.user)
        conversation.messages.exclude(sender=request.user).update(is_read=True)
        return Response({'success': True}, status=status.HTTP_200_OK)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    total_unread = Message.objects.filter(
        conversation__participants=request.user,
        is_read=False
    ).exclude(sender=request.user).count()
    
    return Response({'unread_count': total_unread}, status=status.HTTP_200_OK)