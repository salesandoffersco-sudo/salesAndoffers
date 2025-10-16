"use client";

import { ReactNode } from "react";
import { FiLoader } from "react-icons/fi";
import Button from "./Button";

interface LoadingButtonProps {
  loading: boolean;
  children: ReactNode;
  loadingText?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export default function LoadingButton({
  loading,
  children,
  loadingText,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button'
}: LoadingButtonProps) {
  const enhancedClassName = `${className} ${loading ? 'opacity-80 cursor-wait' : ''} transition-all duration-300 hover:scale-105 active:scale-95`;
  
  return (
    <Button
      variant={variant}
      size={size}
      className={enhancedClassName}
      onClick={onClick}
      disabled={loading || disabled}
      type={type}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <FiLoader className="animate-spin h-4 w-4 mr-2" />
          <span className="animate-pulse">{loadingText || children}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}