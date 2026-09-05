import React, { InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = 'text',
      className,
      containerClassName,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={twMerge('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-[#2b2b2b] uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={currentType}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full bg-[#ffffff] text-[#2b2b2b] placeholder-[#b3b3b3] rounded-xl border border-[#d4d4d4] px-3.5 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:border-[#2b2b2b] focus:ring-2 focus:ring-[#2b2b2b]/15 disabled:bg-[#d4d4d4]/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
                leftIcon && 'pl-10',
                (rightIcon || isPassword) && 'pr-10',
                error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
                className
              )
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
