import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cyan' | 'purple' | 'gradient';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  label,
  size = 'md',
  variant = 'gradient',
  className,
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    cyan: 'bg-[#2b2b2b] shadow-xs',
    purple: 'bg-[#2b2b2b] shadow-xs',
    gradient: 'bg-gradient-to-r from-[#b3b3b3] to-[#2b2b2b]',
  };

  return (
    <div className={twMerge('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="font-semibold text-[#2b2b2b]">{label || 'Progress'}</span>
          <span className="font-bold text-[#2b2b2b]">{percentage}%</span>
        </div>
      )}
      <div className={twMerge('w-full bg-[#d4d4d4]/40 rounded-full overflow-hidden border border-[#d4d4d4]', sizeClasses[size])}>
        <div
          className={twMerge('h-full transition-all duration-500 ease-out rounded-full', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
