"use client";

import { useState } from "react";
import { FiSearch, FiMoreVertical, FiMessageCircle } from "react-icons/fi";
import VerificationBadge from "./VerificationBadge";

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
  type: 'text' | 'image' | 'file' | 'offer';
  is_read: boolean;
  attachment?: any;
}

interface Conversation {
  id: number;
  user: User;
  last_message: Message;
  unread_count: number;
  updated_at: string;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  isMobile?: boolean;
  loading?: boolean;
}

export default function ConversationsList({
  conversations,
  selectedConversation,
  onConversationSelect,
  isMobile = false,
  loading = false
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conversation.user.business_name && conversation.user.business_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div className="h-full bg-[rgb(var(--color-card))] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[rgb(var(--color-border))]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">Messages</h1>
          <button className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors">
            <FiMoreVertical className="w-5 h-5 text-[rgb(var(--color-muted))]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))] w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text))] placeholder-[rgb(var(--color-muted))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <FiMessageCircle className="w-8 h-8 text-[rgb(var(--color-muted))]" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-[rgb(var(--color-muted))] text-center">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Start a conversation by contacting a seller'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[rgb(var(--color-bg))] ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {conversation.user.avatar ? (
                        <img 
                          src={conversation.user.avatar} 
                          alt={conversation.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {conversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* Online Status */}
                    {conversation.user.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <h3 className="font-semibold text-[rgb(var(--color-text))] truncate">
                          {conversation.user.name}
                        </h3>
                        {conversation.user.is_verified && (
                          <VerificationBadge 
                            isVerified={true} 
                            type={conversation.user.role === 'seller' ? 'seller' : 'user'} 
                            size="sm" 
                          />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-[rgb(var(--color-muted))]">
                          {formatTime(conversation.last_message.timestamp)}
                        </span>
                        {conversation.unread_count > 0 && (
                          <div className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Name for Sellers */}
                    {conversation.user.role === 'seller' && conversation.user.business_name && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 truncate">
                        {conversation.user.business_name}
                      </p>
                    )}

                    {/* Last Message */}
                    <p className={`text-sm truncate ${
                      conversation.unread_count > 0 
                        ? 'text-[rgb(var(--color-text))] font-medium' 
                        : 'text-[rgb(var(--color-muted))]'
                    }`}>
                      {conversation.last_message.sender_id === 1 ? 'You: ' : ''}
                      {truncateMessage(conversation.last_message.content)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}