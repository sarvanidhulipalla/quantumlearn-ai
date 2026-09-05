import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#ffffff] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    xs: 'text-[11px] px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#2b2b2b] hover:bg-[#1f1f1f] text-[#ffffff] shadow-sm shadow-[#2b2b2b]/20 focus:ring-[#2b2b2b] border border-[#2b2b2b]',
    secondary:
      'bg-[#ffffff] hover:bg-[#f4f4f4] text-[#2b2b2b] border border-[#d4d4d4] focus:ring-[#2b2b2b]',
    outline:
      'bg-[#ffffff] hover:bg-[#f4f4f4] text-[#2b2b2b] border border-[#d4d4d4] hover:border-[#b3b3b3] focus:ring-[#2b2b2b]',
    ghost:
      'bg-transparent hover:bg-[#d4d4d4]/20 text-[#2b2b2b] hover:text-black focus:ring-[#2b2b2b]',
    glow:
      'bg-[#2b2b2b] hover:bg-[#1a1a1a] text-[#ffffff] shadow-md shadow-[#2b2b2b]/25 focus:ring-[#2b2b2b] border border-[#2b2b2b]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-400',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
