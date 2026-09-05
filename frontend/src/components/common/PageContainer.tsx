import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface PageContainerProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  maxWidth = '7xl',
  className,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={twMerge('w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8', maxWidthClasses[maxWidth], className)}>
      {(title || actions || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-[#d4d4d4]">
          <div>
            <div className="flex items-center gap-3">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2b2b2b]">
                  {title}
                </h1>
              )}
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[#2b2b2b]/70 max-w-2xl leading-relaxed font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default PageContainer;
