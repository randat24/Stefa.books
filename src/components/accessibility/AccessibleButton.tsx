'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Доступная кнопка с поддержкой состояний загрузки и иконок
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-lg
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200 ease-in-out
      active:scale-[0.98]
    `;

    const variantClasses = {
      primary: `
        bg-brand-yellow text-brand hover:bg-brand-yellow-light
        focus:ring-brand-yellow shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-gray-100 text-gray-900 hover:bg-gray-200
        focus:ring-gray-500 shadow-sm hover:shadow-md
      `,
      outline: `
        border border-gray-300 bg-white text-gray-700 hover:bg-gray-50
        focus:ring-brand-yellow shadow-sm hover:shadow-md
      `,
      ghost: `
        bg-transparent text-gray-700 hover:bg-gray-100
        focus:ring-gray-500
      `,
      danger: `
        bg-red-600 text-white hover:bg-red-700
        focus:ring-red-500 shadow-sm hover:shadow-md
      `
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-body-sm h-8',
      md: 'px-4 py-2 text-body-sm h-10',
      lg: 'px-6 py-3 text-body h-12'
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClasses,
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 
            className="animate-spin mr-2 h-4 w-4" 
            aria-hidden="true"
          />
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span>
          {loading && loadingText ? loadingText : children}
        </span>
        
        {!loading && rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

/**
 * Кнопка-переключатель с поддержкой состояний
 */
interface ToggleButtonProps extends Omit<AccessibleButtonProps, 'children'> {
  pressed: boolean;
  pressedText: string;
  unpressedText: string;
  pressedIcon?: React.ReactNode;
  unpressedIcon?: React.ReactNode;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({
    pressed,
    pressedText,
    unpressedText,
    pressedIcon,
    unpressedIcon,
    className,
    ...props
  }, ref) => {
    return (
      <AccessibleButton
        ref={ref}
        className={cn(
          pressed ? 'bg-brand-yellow text-brand' : 'bg-gray-100 text-gray-700',
          className
        )}
        aria-pressed={pressed}
        aria-label={pressed ? pressedText : unpressedText}
        {...props}
      >
        {pressed ? pressedIcon : unpressedIcon}
        <span className="ml-2">
          {pressed ? pressedText : unpressedText}
        </span>
      </AccessibleButton>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';

/**
 * Группа кнопок с поддержкой клавиатуры
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  role?: 'group' | 'toolbar' | 'menubar';
  ariaLabel?: string;
}

export function ButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
  role = 'group',
  ariaLabel
}: ButtonGroupProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Кнопка с выпадающим меню
 */
interface DropdownButtonProps extends AccessibleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  menuId: string;
  children: React.ReactNode;
}

export const DropdownButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(
  ({
    isOpen,
    onToggle,
    menuId,
    children,
    ...props
  }, ref) => {
    return (
      <AccessibleButton
        ref={ref}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        {...props}
      >
        {children}
      </AccessibleButton>
    );
  }
);

DropdownButton.displayName = 'DropdownButton';
