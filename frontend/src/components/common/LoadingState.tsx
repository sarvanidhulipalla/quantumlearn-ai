import React from 'react';
import { Atom, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
  variant?: 'spinner' | 'quantum';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Initializing Quantum State...',
  subtext = 'Preparing quantum registers and state vectors',
  fullScreen = false,
  variant = 'quantum',
  className,
}) => {
  const content = (
    <div className={twMerge('flex flex-col items-center justify-center p-8 text-center', className)}>
      {variant === 'quantum' ? (
        <div className="relative mb-6 flex items-center justify-center">
          {/* Glowing pulse aura */}
          <div className="absolute w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute w-16 h-16 bg-purple-600/30 rounded-full blur-md animate-ping" />
          {/* Spinning atom */}
          <div className="relative p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-cyan-400">
            <Atom className="w-10 h-10 animate-spin-slow" />
          </div>
        </div>
      ) : (
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
      )}
      <h4 className="text-base font-semibold text-slate-100 tracking-tight">{message}</h4>
      {subtext && <p className="text-xs text-slate-400 mt-1.5 max-w-sm">{subtext}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e]/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={twMerge('animate-pulse bg-slate-800/60 rounded-xl', className)} />
);

export default LoadingState;
