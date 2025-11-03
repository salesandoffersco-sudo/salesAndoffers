"use client";

import { useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { messagingApi } from "../lib/api/messaging";
import { isAuthenticated } from "../lib/auth";

interface ContactButtonProps {
  recipientId: number;
  recipientName: string;
  context?: {
    type: 'offer' | 'seller';
    title: string;
    id: number;
  };
  className?: string;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function ContactButton({
  recipientId,
  recipientName,
  context,
  className = "",
  variant = "outline",
  size = "md"
}: ContactButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContact = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Start conversation
      const conversation = await messagingApi.startConversation(recipientId);
      
      // Send context message if provided
      if (context) {
        const contextMessage = context.type === 'offer' 
          ? `Hi! I'm interested in your offer: "${context.title}". Can you tell me more about it?`
          : `Hi! I saw your profile and I'm interested in your services. Can we discuss potential deals?`;
          
        await messagingApi.sendMessage({
          conversation_id: conversation.id,
          content: contextMessage
        });
      }
      
      // Redirect to messages page
      router.push('/messages');
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleContact}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Connecting...
        </div>
      ) : (
        <div className="flex items-center">
          <FiMessageCircle className="mr-2" />
          Contact {recipientName}
        </div>
      )}
    </Button>
  );
}