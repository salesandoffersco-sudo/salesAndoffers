import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/messages`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_online: boolean;
  is_seller: boolean;
}

export interface Message {
  id: number;
  sender: User;
  content: string;
  message_type: string;
  attachment_data?: any;
  timestamp: string;
  is_read: boolean;
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message: Message;
  unread_count: number;
  other_participant: User;
  created_at: string;
  updated_at: string;
}

export const messagingApi = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/conversations/');
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await api.get(`/conversations/${conversationId}/messages/`);
    return response.data;
  },

  // Send a message
  sendMessage: async (data: { conversation_id?: number; recipient_id?: number; content: string; message_type?: string; attachment_data?: any }): Promise<Message> => {
    const response = await api.post('/send/', data);
    return response.data;
  },

  // Start a new conversation
  startConversation: async (recipientId: number): Promise<Conversation> => {
    const response = await api.post('/start-conversation/', { recipient_id: recipientId });
    return response.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/search-users/?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Mark messages as read
  markMessagesRead: async (conversationId: number): Promise<void> => {
    await api.post('/mark-read/', { conversation_id: conversationId });
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/unread-count/');
    return response.data.unread_count;
  },
};