'use client';

import React, { useState, useEffect } from 'react';
import { useBreakpoint } from './ResponsiveContainer';

interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  onSubmit?: (data: any) => void;
}

/**
 * Адаптивная форма с различными лейаутами
 */
export function ResponsiveForm({
  children,
  className = '',
  layout = 'vertical',
  columns = {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 2,
    xl: 3
  },
  gap = 'gap-4',
  onSubmit
}: ResponsiveFormProps) {
  const { breakpoint } = useBreakpoint();

  const getColumns = () => {
    switch (breakpoint) {
      case 'xs':
        return columns.xs || 1;
      case 'sm':
        return columns.sm || 1;
      case 'md':
        return columns.md || 2;
      case 'lg':
        return columns.lg || 2;
      case 'xl':
        return columns.xl || 3;
      default:
        return columns.xl || 3;
    }
  };

  const getLayoutClasses = () => {
    const cols = getColumns();
    
    switch (layout) {
      case 'horizontal':
        return 'flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0';
      case 'grid':
        return `grid grid-cols-${cols} ${gap}`;
      case 'vertical':
      default:
        return 'space-y-4';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      onSubmit(data);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${getLayoutClasses()} ${className}`}
    >
      {children}
    </form>
  );
}

/**
 * Адаптивное поле формы
 */
interface ResponsiveFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  labelWidth?: string;
}

export function ResponsiveField({
  label,
  children,
  required = false,
  error,
  helpText,
  className = '',
  labelWidth = 'sm:w-32'
}: ResponsiveFieldProps) {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-body-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {error && (
          <p className="text-body-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-body-sm text-neutral-500">{helpText}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-4 ${className}`}>
      <label className={`${labelWidth} text-body-sm font-medium text-neutral-700 pt-2`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex-1 space-y-1">
        {children}
        {error && (
          <p className="text-body-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-body-sm text-neutral-500">{helpText}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Адаптивная кнопка
 */
interface ResponsiveButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ResponsiveButton({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  disabled = false,
  loading = false
}: ResponsiveButtonProps) {
  const { isMobile } = useBreakpoint();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-accent text-brand hover:bg-accent-light';
      case 'secondary':
        return 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200';
      case 'outline':
        return 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50';
      case 'ghost':
        return 'text-neutral-700 hover:bg-neutral-100';
      default:
        return 'bg-accent text-brand hover:bg-accent-light';
    }
  };

  const getSizeClasses = () => {
    if (isMobile) {
      switch (size) {
        case 'sm':
          return 'px-3 py-2 text-body-sm h-10';
        case 'md':
          return 'px-4 py-3 text-body h-12';
        case 'lg':
          return 'px-6 py-4 text-body-lg h-14';
        default:
          return 'px-4 py-3 text-body h-12';
      }
    } else {
      switch (size) {
        case 'sm':
          return 'px-3 py-2 text-body-sm h-8';
        case 'md':
          return 'px-4 py-2 text-body-sm h-10';
        case 'lg':
          return 'px-6 py-3 text-body h-12';
        default:
          return 'px-4 py-2 text-body-sm h-10';
      }
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        active:scale-[0.98]
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-2xl animate-spin mr-2" />
      )}
      {children}
    </button>
  );
}

/**
 * Адаптивная группа кнопок
 */
interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: string;
}

export function ResponsiveButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
  spacing = 'gap-2'
}: ResponsiveButtonGroupProps) {
  const { isMobile } = useBreakpoint();

  const getOrientationClasses = () => {
    if (isMobile) {
      return 'flex-col space-y-2';
    }
    
    switch (orientation) {
      case 'vertical':
        return 'flex-col space-y-2';
      case 'horizontal':
      default:
        return 'flex-row space-x-2';
    }
  };

  return (
    <div className={`flex ${getOrientationClasses()} ${spacing} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Адаптивный модальный диалог
 */
interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'md'
}: ResponsiveModalProps) {
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    if (isMobile) {
      return 'w-full h-full max-w-none max-h-none rounded-none';
    }

    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div
        className={`
          relative bg-white rounded-xl shadow-2xl w-full
          ${getSizeClasses()}
          ${className}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-body-lg font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="
              p-2 text-neutral-400 hover:text-neutral-600
              focus:outline-none focus:ring-2 focus:ring-accent
              rounded-lg transition-colors
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Импорт иконки
import { X } from 'lucide-react';
