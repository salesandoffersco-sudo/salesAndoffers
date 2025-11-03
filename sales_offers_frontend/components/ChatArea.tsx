"use client";

import { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiPhone, FiVideo, FiInfo, FiSend, FiPaperclip, FiSmile, FiMoreVertical } from "react-icons/fi";
import VerificationBadge from "./VerificationBadge";
import AttachmentModal from "./AttachmentModal";
import MessageAttachment from "./MessageAttachment";
import { getCurrentUserId } from "../lib/auth";

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
  attachment?: {
    type: 'file' | 'offer';
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
    offer?: {
      id: number;
      title: string;
      discounted_price: string;
      main_image?: string;
      discount_percentage: number;
    };
  };
}

interface Conversation {
  id: number;
  user: User;
  last_message: Message;
  unread_count: number;
  updated_at: string;
}

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string, attachment?: any) => void;
  onShowUserInfo: () => void;
  showBackButton: boolean;
  onBack: () => void;
  isMobile?: boolean;
  currentUserId?: number | null;
}

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  onShowUserInfo,
  showBackButton,
  onBack,
  isMobile = false,
  currentUserId = null
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleFileAttachment = () => {
    setShowAttachmentModal(true);
  };

  const handleSendFile = async (file: File) => {
    try {
      // Create a temporary URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      // Create attachment data
      const attachment = {
        type: 'file' as const,
        name: file.name,
        url: fileUrl,
        size: file.size,
        mimeType: file.type
      };
      
      // Send message with attachment
      onSendMessage(`📎 ${file.name}`, attachment);
      
    } catch (error) {
      console.error('Failed to send file:', error);
    }
  };

  const handleSendOffer = async (offer: any) => {
    try {
      const attachment = {
        type: 'offer' as const,
        name: offer.title,
        url: `/offers/${offer.id}`,
        offer: offer
      };
      
      onSendMessage(`🏷️ ${offer.title}`, attachment);
      
    } catch (error) {
      console.error('Failed to send offer:', error);
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-[rgb(var(--color-card))] border-b border-[rgb(var(--color-border))] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-[rgb(var(--color-text))]" />
              </button>
            )}

            {/* User Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                {conversation.user.avatar ? (
                  <img 
                    src={conversation.user.avatar} 
                    alt={conversation.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {conversation.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {conversation.user.is_online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-[rgb(var(--color-text))] truncate">
                  {conversation.user.name}
                </h2>
                {conversation.user.is_verified && (
                  <VerificationBadge 
                    isVerified={true} 
                    type={conversation.user.role === 'seller' ? 'seller' : 'user'} 
                    size="sm" 
                  />
                )}
              </div>
              
              {conversation.user.role === 'seller' && conversation.user.business_name && (
                <p className="text-sm text-purple-600 dark:text-purple-400 truncate">
                  {conversation.user.business_name}
                </p>
              )}
              
              <p className="text-xs text-[rgb(var(--color-muted))]">
                {conversation.user.is_online 
                  ? 'Online' 
                  : `Last seen ${formatLastSeen(conversation.user.last_seen || '')}`
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => alert('Voice call functionality would be implemented here')}
              className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors"
              title="Voice Call"
            >
              <FiPhone className="w-5 h-5 text-[rgb(var(--color-muted))]" />
            </button>
            <button 
              onClick={() => alert('Video call functionality would be implemented here')}
              className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors"
              title="Video Call"
            >
              <FiVideo className="w-5 h-5 text-[rgb(var(--color-muted))]" />
            </button>
            <button 
              onClick={onShowUserInfo}
              className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors"
              title="User Info"
            >
              <FiInfo className="w-5 h-5 text-[rgb(var(--color-muted))]" />
            </button>
            <div className="relative">
              <button 
                onClick={handleMoreMenu}
                className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors"
                title="More Options"
              >
                <FiMoreVertical className="w-5 h-5 text-[rgb(var(--color-muted))]" />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-lg shadow-lg z-50">
                  <button className="w-full px-4 py-2 text-left hover:bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] text-sm">
                    Clear Chat
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] text-sm">
                    Block User
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-[rgb(var(--color-bg))] text-red-600 text-sm">
                    Report User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const actualCurrentUserId = currentUserId || getCurrentUserId();
          const isCurrentUser = message.sender_id === actualCurrentUserId;
          const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar && !isCurrentUser && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {conversation.user.avatar ? (
                        <img 
                          src={conversation.user.avatar} 
                          alt={conversation.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {conversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`relative ${
                  message.attachment ? 'p-0' : 'px-4 py-2'
                } rounded-2xl ${
                  isCurrentUser
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-[rgb(var(--color-card))] text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))] rounded-bl-md'
                }`}>
                  {message.attachment ? (
                    <div className="p-2">
                      <MessageAttachment attachment={message.attachment} />
                      <p className={`text-xs mt-2 ${
                        isCurrentUser ? 'text-purple-100' : 'text-[rgb(var(--color-muted))]'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-purple-100' : 'text-[rgb(var(--color-muted))]'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[rgb(var(--color-card))] border-t border-[rgb(var(--color-border))] p-4">
        <div className="flex items-end space-x-3">
          <button 
            onClick={handleFileAttachment}
            className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors flex-shrink-0"
            title="Attach File"
          >
            <FiPaperclip className="w-5 h-5 text-[rgb(var(--color-muted))]" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] rounded-2xl text-[rgb(var(--color-text))] placeholder-[rgb(var(--color-muted))] focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          <div className="relative flex-shrink-0">
            <button 
              onClick={handleEmojiClick}
              className="p-2 hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors"
              title="Add Emoji"
            >
              <FiSmile className="w-5 h-5 text-[rgb(var(--color-muted))]" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-xl shadow-xl z-50">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-[rgb(var(--color-text))] mb-3">Frequently Used</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🙏', '👏', '😎', '🥰'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[rgb(var(--color-bg))] rounded-lg transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              newMessage.trim()
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-[rgb(var(--color-bg))] text-[rgb(var(--color-muted))] cursor-not-allowed'
            }`}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        onSendFile={handleSendFile}
        onSendOffer={handleSendOffer}
      />
    </div>
  );
}