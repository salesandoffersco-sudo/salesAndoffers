"use client";

// Comprehensive messaging system with responsive three-column layout
import { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiMoreVertical, FiSend, FiPaperclip, FiSmile, FiPhone, FiVideo, FiInfo } from "react-icons/fi";
import ConversationsList from "../../components/ConversationsList";
import ChatArea from "../../components/ChatArea";
import UserInfoSidebar from "../../components/UserInfoSidebar";
import { messagingApi, type Conversation, type Message, type User } from "../../lib/api/messaging";
import { getCurrentUserId } from "../../lib/auth";

// Transform API data to component format
interface ComponentUser {
  id: number;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller';
  business_name?: string;
  is_online: boolean;
  last_seen?: string;
  is_verified?: boolean;
}

interface ComponentMessage {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  is_read: boolean;
}

interface ComponentConversation {
  id: number;
  user: ComponentUser;
  last_message: ComponentMessage;
  unread_count: number;
  updated_at: string;
}

// Transform API data to component format
const transformUser = (apiUser: User): ComponentUser => ({
  id: apiUser.id,
  name: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
  avatar: apiUser.profile_picture,
  role: apiUser.is_seller ? 'seller' : 'buyer',
  is_online: apiUser.is_online,
  is_verified: true // Can be enhanced based on backend data
});

const transformMessage = (apiMessage: Message, currentUserId: number): ComponentMessage => ({
  id: apiMessage.id,
  sender_id: apiMessage.sender.id,
  content: apiMessage.content,
  timestamp: apiMessage.timestamp,
  type: 'text',
  is_read: apiMessage.is_read
});

const transformConversation = (apiConversation: Conversation, currentUserId: number): ComponentConversation => ({
  id: apiConversation.id,
  user: transformUser(apiConversation.other_participant),
  last_message: transformMessage(apiConversation.last_message, currentUserId),
  unread_count: apiConversation.unread_count,
  updated_at: apiConversation.updated_at
});

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<ComponentConversation | null>(null);
  const [conversations, setConversations] = useState<ComponentConversation[]>([]);
  const [messages, setMessages] = useState<ComponentMessage[]>([]);
  const [currentView, setCurrentView] = useState<'conversations' | 'chat' | 'info'>('conversations');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(1);

  // Initialize current user ID on client side
  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      setCurrentView('chat');
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const apiConversations = await messagingApi.getConversations();
      const transformedConversations = apiConversations.map(conv => 
        transformConversation(conv, currentUserId)
      );
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const apiMessages = await messagingApi.getMessages(conversationId);
      const transformedMessages = apiMessages.map(msg => 
        transformMessage(msg, currentUserId)
      );
      setMessages(transformedMessages.reverse()); // Reverse to show oldest first
      
      // Mark messages as read
      await messagingApi.markMessagesRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleConversationSelect = (conversation: ComponentConversation) => {
    setSelectedConversation(conversation);
    setShowUserInfo(false);
  };

  const handleBackToConversations = () => {
    setCurrentView('conversations');
    setSelectedConversation(null);
    setShowUserInfo(false);
  };

  const handleShowUserInfo = () => {
    setCurrentView('info');
    setShowUserInfo(true);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;
    
    try {
      const apiMessage = await messagingApi.sendMessage({
        conversation_id: selectedConversation.id,
        content
      });
      
      const newMessage = transformMessage(apiMessage, currentUserId);
      setMessages(prev => [...prev, newMessage]);
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="h-screen bg-[rgb(var(--color-bg))] flex overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        <div className="w-80 flex-shrink-0 border-r border-[rgb(var(--color-border))]">
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            loading={loading}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatArea
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onShowUserInfo={handleShowUserInfo}
              showBackButton={false}
              onBack={() => {}}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch className="w-12 h-12 text-[rgb(var(--color-muted))]" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">
                  Select a conversation
                </h3>
                <p className="text-[rgb(var(--color-muted))] max-w-md">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {selectedConversation && (
          <div className="w-80 flex-shrink-0 border-l border-[rgb(var(--color-border))]">
            <UserInfoSidebar
              user={selectedConversation.user}
              onClose={() => setShowUserInfo(false)}
              showCloseButton={false}
            />
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-full flex flex-col">
        {currentView === 'conversations' && (
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            isMobile={true}
            loading={loading}
          />
        )}

        {currentView === 'chat' && selectedConversation && (
          <ChatArea
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            onShowUserInfo={handleShowUserInfo}
            showBackButton={true}
            onBack={handleBackToConversations}
            isMobile={true}
          />
        )}

        {currentView === 'info' && selectedConversation && (
          <UserInfoSidebar
            user={selectedConversation.user}
            onClose={() => setCurrentView('chat')}
            showCloseButton={true}
            isMobile={true}
          />
        )}
      </div>
    </div>
  );
}