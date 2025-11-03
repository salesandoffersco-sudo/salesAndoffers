from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from messaging.models import Conversation, Message

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample conversations for testing'

    def handle(self, *args, **options):
        # Get users
        users = User.objects.all()[:5]  # Get first 5 users
        
        if len(users) < 2:
            self.stdout.write(self.style.ERROR('Need at least 2 users to create conversations'))
            return
        
        # Create sample conversations
        sample_messages = [
            "Hi! I'm interested in your offer. Can you tell me more about it?",
            "Hello! Thanks for reaching out. I'd be happy to help you with that.",
            "What are the payment options available?",
            "We accept all major credit cards and PayPal.",
            "That sounds great! When can we schedule a meeting?",
            "I'm available tomorrow afternoon. Would 2 PM work for you?",
            "Perfect! Looking forward to it.",
            "Great! I'll send you the meeting details shortly.",
        ]
        
        # Create conversations between users
        for i in range(min(3, len(users) - 1)):  # Create up to 3 conversations
            user1 = users[i]
            user2 = users[i + 1]
            
            # Create conversation
            conversation = Conversation.objects.create()
            conversation.participants.add(user1, user2)
            
            # Add messages
            for j, message_text in enumerate(sample_messages[:4]):  # Add 4 messages per conversation
                sender = user1 if j % 2 == 0 else user2
                Message.objects.create(
                    conversation=conversation,
                    sender=sender,
                    content=message_text
                )
            
            self.stdout.write(
                self.style.SUCCESS(f'Created conversation between {user1.username} and {user2.username}')
            )
        
        self.stdout.write(self.style.SUCCESS('Sample conversations created successfully!'))