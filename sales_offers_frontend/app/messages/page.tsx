"use client";

// Comprehensive messaging system with responsive three-column layout
import { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiMoreVertical, FiSend, FiPaperclip, FiSmile, FiPhone, FiVideo, FiInfo } from "react-icons/fi";
import ConversationsList from "../../components/ConversationsList";
import ChatArea from "../../components/ChatArea";
import UserInfoSidebar from "../../components/UserInfoSidebar";

interface User {
  id: number;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller';
  business_name?: string;
  is_online: boolean;
  last_seen?: string;
  is_verified?: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  is_read: boolean;
}

interface Conversation {
  id: number;
  user: User;
  last_message: Message;
  unread_count: number;
  updated_at: string;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: 1,
    user: {
      id: 2,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      role: "seller",
      business_name: "Sarah's Electronics Store",
      is_online: true,
      is_verified: true
    },
    last_message: {
      id: 1,
      sender_id: 2,
      content: "Hi! I have the iPhone 15 Pro in stock. Would you like to see more details?",
      timestamp: "2024-01-15T10:30:00Z",
      type: "text",
      is_read: false
    },
    unread_count: 2,
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    user: {
      id: 3,
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      role: "buyer",
      is_online: false,
      last_seen: "2024-01-15T09:15:00Z",
      is_verified: false
    },
    last_message: {
      id: 2,
      sender_id: 1,
      content: "Thanks for your interest in the laptop deal!",
      timestamp: "2024-01-15T09:15:00Z",
      type: "text",
      is_read: true
    },
    unread_count: 0,
    updated_at: "2024-01-15T09:15:00Z"
  },
  {
    id: 3,
    user: {
      id: 4,
      name: "Emma Wilson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      role: "seller",
      business_name: "Wilson Fashion Hub",
      is_online: true,
      is_verified: true
    },
    last_message: {
      id: 3,
      sender_id: 4,
      content: "The dress you inquired about is available in size M and L",
      timestamp: "2024-01-14T16:45:00Z",
      type: "text",
      is_read: true
    },
    unread_count: 0,
    updated_at: "2024-01-14T16:45:00Z"
  }
];

const mockMessages: Message[] = [
  {
    id: 1,
    sender_id: 2,
    content: "Hi! I saw your inquiry about the iPhone 15 Pro. I have it in stock!",
    timestamp: "2024-01-15T10:00:00Z",
    type: "text",
    is_read: true
  },
  {
    id: 2,
    sender_id: 1,
    content: "Great! What's the price and condition?",
    timestamp: "2024-01-15T10:05:00Z",
    type: "text",
    is_read: true
  },
  {
    id: 3,
    sender_id: 2,
    content: "It's brand new, sealed box. Price is KES 145,000. I can offer 10% discount for immediate purchase.",
    timestamp: "2024-01-15T10:10:00Z",
    type: "text",
    is_read: true
  },
  {
    id: 4,
    sender_id: 1,
    content: "That sounds good. Can you send me some photos?",
    timestamp: "2024-01-15T10:15:00Z",
    type: "text",
    is_read: true
  },
  {
    id: 5,
    sender_id: 2,
    content: "Hi! I have the iPhone 15 Pro in stock. Would you like to see more details?",
    timestamp: "2024-01-15T10:30:00Z",
    type: "text",
    is_read: false
  }
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentView, setCurrentView] = useState<'conversations' | 'chat' | 'info'>('conversations');
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages);
      setCurrentView('chat');
    }
  }, [selectedConversation]);

  const handleConversationSelect = (conversation: Conversation) => {
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

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      sender_id: 1,
      content,
      timestamp: new Date().toISOString(),
      type: 'text',
      is_read: false
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="h-screen bg-[rgb(var(--color-bg))] flex overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        <div className="w-80 flex-shrink-0 border-r border-[rgb(var(--color-border))]">
          <ConversationsList
            conversations={mockConversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
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
            conversations={mockConversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            isMobile={true}
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