"use client";

import { FiCheck, FiShield } from "react-icons/fi";

interface VerificationBadgeProps {
  isVerified: boolean;
  type?: 'user' | 'seller' | 'deal';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function VerificationBadge({ 
  isVerified, 
  type = 'user', 
  size = 'md', 
  showText = false,
  className = '' 
}: VerificationBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const typeConfig = {
    user: {
      icon: FiCheck,
      color: 'bg-blue-500',
      text: 'Verified User'
    },
    seller: {
      icon: FiShield,
      color: 'bg-green-500',
      text: 'Verified Seller'
    },
    deal: {
      icon: FiCheck,
      color: 'bg-purple-500',
      text: 'Verified Deal'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className={`
        ${config.color} text-white rounded-full flex items-center justify-center
        ${sizeClasses[size]}
      `}>
        <Icon className={`${size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      </div>
      {showText && (
        <span className={`font-medium text-${config.color.replace('bg-', '')} ${sizeClasses[size].split(' ')[2]}`}>
          {config.text}
        </span>
      )}
    </div>
  );
}