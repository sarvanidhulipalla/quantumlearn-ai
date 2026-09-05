import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  footer?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={twMerge(
          'relative w-full bg-[#0d121f] border border-slate-700/80 rounded-2xl shadow-2xl shadow-purple-900/20 p-6 sm:p-8 z-10 transform transition-all duration-300 text-slate-100',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/5 mb-5">
          <div>
            {title && <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>}
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div>{children}</div>

        {/* Modal Footer */}
        {footer && <div className="pt-4 border-t border-white/5 mt-5">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
