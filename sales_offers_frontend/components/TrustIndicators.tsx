"use client";

import { FiShield, FiLock, FiAward, FiCheckCircle, FiDollarSign, FiStar } from "react-icons/fi";

interface TrustIndicatorsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'badges' | 'minimal' | 'detailed';
  showAll?: boolean;
}

export default function TrustIndicators({
  size = 'sm',
  className = '',
  variant = 'badges',
  showAll = true
}: TrustIndicatorsProps) {
  const indicators = [
    {
      icon: FiDollarSign,
      text: 'Best Price',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      priority: 5
    },
    {
      icon: FiStar,
      text: 'Top Rated',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      priority: 6
    }
  ];

  const displayIndicators = showAll ? indicators : indicators.slice(0, 4);

  const sizeClasses = {
    sm: { text: 'text-xs', gap: 'gap-2', icon: 'w-3 h-3', padding: 'px-2 py-1' },
    md: { text: 'text-sm', gap: 'gap-3', icon: 'w-4 h-4', padding: 'px-3 py-1.5' },
    lg: { text: 'text-base', gap: 'gap-4', icon: 'w-5 h-5', padding: 'px-4 py-2' }
  };

  const classes = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center ${classes.gap} ${className}`}>
        {displayIndicators.slice(0, 2).map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <div key={index} className={`flex items-center gap-1 ${indicator.color}`}>
              <Icon className={classes.icon} />
              <span className={`font-medium ${classes.text}`}>{indicator.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {displayIndicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <div key={index} className={`flex items-center gap-2 ${classes.padding} rounded-lg ${indicator.bgColor}`}>
              <Icon className={`${classes.icon} ${indicator.color}`} />
              <span className={`font-medium ${indicator.color} ${classes.text}`}>
                {indicator.text}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap ${classes.gap} ${className}`}>
      {displayIndicators.map((indicator, index) => {
        const Icon = indicator.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-1 ${classes.padding} rounded-full bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] ${classes.text}`}
          >
            <Icon className={`${classes.icon} ${indicator.color}`} />
            <span className="text-[rgb(var(--color-fg))] font-medium">
              {indicator.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}