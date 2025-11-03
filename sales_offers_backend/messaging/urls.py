from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('send/', views.send_message, name='send-message'),
    path('search-users/', views.search_users, name='search-users'),
    path('start-conversation/', views.start_conversation, name='start-conversation'),
    path('mark-read/', views.mark_messages_read, name='mark-messages-read'),
    path('unread-count/', views.unread_count, name='unread-count'),
]