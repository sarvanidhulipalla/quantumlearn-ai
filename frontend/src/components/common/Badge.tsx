import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  variant?: 'cyan' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'cyan',
  size = 'sm',
  children,
  icon,
  className,
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 font-medium gap-1',
    sm: 'text-xs px-2.5 py-1 font-medium gap-1.5',
    md: 'text-sm px-3 py-1.5 font-semibold gap-2',
  };

  const variantStyles = {
    cyan: 'bg-[#2b2b2b] text-[#ffffff] border border-[#2b2b2b] font-medium shadow-xs',
    purple: 'bg-[#d4d4d4]/50 text-[#2b2b2b] border border-[#d4d4d4] font-semibold',
    blue: 'bg-[#ffffff] text-[#2b2b2b] border border-[#d4d4d4] font-medium',
    emerald: 'bg-[#d4d4d4]/60 text-[#2b2b2b] border border-[#b3b3b3] font-semibold',
    amber: 'bg-[#d4d4d4]/40 text-[#2b2b2b] border border-[#d4d4d4] font-medium',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200 font-medium',
    slate: 'bg-[#f4f4f4] text-[#2b2b2b] border border-[#d4d4d4] font-medium',
    outline: 'bg-transparent text-[#2b2b2b] border border-[#d4d4d4] font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full transition-colors duration-150',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
