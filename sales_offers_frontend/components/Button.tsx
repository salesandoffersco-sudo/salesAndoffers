import React from 'react';

interface ButtonProps<T extends React.ElementType = 'button'> {
  as?: T;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

type PolymorphicButtonProps<T extends React.ElementType> = ButtonProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>;

const Button = <T extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: PolymorphicButtonProps<T>) => {
  const Component = as || 'button';
  const baseStyles = 'font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--color-primary))]';

  const variantStyles = {
    primary: 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] hover:shadow-lg hover:opacity-90',
    secondary: 'bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-on-secondary))] hover:opacity-80',
    outline: 'bg-transparent text-[rgb(var(--color-primary))] border-2 border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-card))]',
    ghost: 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;

