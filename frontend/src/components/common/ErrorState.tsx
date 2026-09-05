import React, { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

export interface ErrorStateProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'error',
  title,
  message,
  onRetry,
  action,
  className,
}) => {
  const iconConfig = {
    error: {
      icon: AlertCircle,
      bg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
      iconColor: 'text-rose-400',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
      iconColor: 'text-amber-400',
    },
    info: {
      icon: Info,
      bg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300',
      iconColor: 'text-cyan-400',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
      iconColor: 'text-emerald-400',
    },
  };

  const { icon: Icon, bg, iconColor } = iconConfig[type];

  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          'p-4 rounded-xl border flex items-start gap-3.5 transition-all text-sm',
          bg,
          className
        )
      )}
    >
      <Icon className={twMerge('w-5 h-5 shrink-0 mt-0.5', iconColor)} />
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-semibold mb-0.5 tracking-tight text-white">{title}</h5>}
        <p className="text-xs leading-relaxed opacity-90">{message}</p>
        {(onRetry || action) && (
          <div className="mt-3 flex items-center gap-3">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
            )}
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
