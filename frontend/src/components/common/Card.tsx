import React, { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  padding = 'md',
  children,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 relative overflow-hidden';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    default: 'bg-[#ffffff] border border-[#d4d4d4] text-[#2b2b2b] shadow-sm',
    glass: 'bg-[#ffffff]/95 backdrop-blur-md border border-[#d4d4d4] text-[#2b2b2b] shadow-sm',
    glow: 'bg-[#ffffff] border border-[#d4d4d4] text-[#2b2b2b] shadow-md shadow-[#2b2b2b]/5',
    interactive:
      'bg-[#ffffff] border border-[#d4d4d4] hover:border-[#2b2b2b] text-[#2b2b2b] shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5',
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, paddingStyles[padding], variantStyles[variant], className))}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className }) => (
  <div className={twMerge('flex items-center justify-between mb-4', className)}>
    <div>
      {title && (
        <h3 className="text-lg font-bold text-[#2b2b2b] tracking-tight">{title}</h3>
      )}
      {subtitle && <p className="text-xs text-[#2b2b2b]/70 mt-0.5 font-normal">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={twMerge('text-[#2b2b2b]/90', className)}>{children}</div>;

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={twMerge(
      'mt-5 pt-4 border-t border-[#d4d4d4] flex items-center justify-between',
      className
    )}
  >
    {children}
  </div>
);

export default Card;
