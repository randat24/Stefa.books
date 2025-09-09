'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ColorSystemButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ColorSystemButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  onClick
}: ColorSystemButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className
  );

  const variantClasses = {
    primary: 'bg-brand text-neutral-0 hover:bg-brand-700 focus:ring-brand-500 shadow-md hover:shadow-lg',
    secondary: 'bg-neutral-0 text-neutral-900 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500',
    accent: 'bg-accent text-neutral-0 hover:bg-accent-700 focus:ring-accent-500 shadow-md hover:shadow-lg',
    success: 'bg-success text-neutral-0 hover:bg-success-700 focus:ring-success-500 shadow-md hover:shadow-lg',
    warning: 'bg-warning text-neutral-0 hover:bg-warning-700 focus:ring-warning-500 shadow-md hover:shadow-lg',
    error: 'bg-error text-neutral-0 hover:bg-error-700 focus:ring-error-500 shadow-md hover:shadow-lg',
    info: 'bg-info text-neutral-0 hover:bg-info-700 focus:ring-info-500 shadow-md hover:shadow-lg',
    neutral: 'bg-neutral-600 text-neutral-0 hover:bg-neutral-700 focus:ring-neutral-500 shadow-md hover:shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-body-sm h-8',
    md: 'px-4 py-2 text-body h-10',
    lg: 'px-6 py-3 text-body-lg h-12'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size]
      )}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  );
}

// Примеры использования
export function ColorSystemButtonExamples() {
  return (
    <div className="space-y-8 p-6 bg-neutral-50 rounded-xl">
      <h2 className="text-h2 text-neutral-900">Color System Button Examples</h2>
      
      {/* Основные варианты */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Основные варианты</h3>
        <div className="flex flex-wrap gap-4">
          <ColorSystemButton variant="primary">Primary</ColorSystemButton>
          <ColorSystemButton variant="secondary">Secondary</ColorSystemButton>
          <ColorSystemButton variant="accent">Accent</ColorSystemButton>
          <ColorSystemButton variant="neutral">Neutral</ColorSystemButton>
        </div>
      </div>

      {/* Семантические варианты */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Семантические варианты</h3>
        <div className="flex flex-wrap gap-4">
          <ColorSystemButton variant="success">Success</ColorSystemButton>
          <ColorSystemButton variant="warning">Warning</ColorSystemButton>
          <ColorSystemButton variant="error">Error</ColorSystemButton>
          <ColorSystemButton variant="info">Info</ColorSystemButton>
        </div>
      </div>

      {/* Размеры */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Размеры</h3>
        <div className="flex flex-wrap items-center gap-4">
          <ColorSystemButton variant="primary" size="sm">Small</ColorSystemButton>
          <ColorSystemButton variant="primary" size="md">Medium</ColorSystemButton>
          <ColorSystemButton variant="primary" size="lg">Large</ColorSystemButton>
        </div>
      </div>

      {/* Состояния */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Состояния</h3>
        <div className="flex flex-wrap gap-4">
          <ColorSystemButton variant="primary">Normal</ColorSystemButton>
          <ColorSystemButton variant="primary" loading>Loading</ColorSystemButton>
          <ColorSystemButton variant="primary" disabled>Disabled</ColorSystemButton>
        </div>
      </div>

      {/* Семантические утилиты */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Семантические утилиты</h3>
        <div className="p-4 bg-neutral-0 border border-neutral-200 rounded-lg">
          <p className="text-readable text-neutral-900 mb-2">
            Основной читаемый текст с оптимальной контрастностью
          </p>
          <p className="text-muted text-neutral-600 mb-2">
            Приглушенный текст для дополнительной информации
          </p>
          <p className="text-subtle text-neutral-500 mb-2">
            Тонкий текст для метаданных
          </p>
          <p className="text-disabled text-neutral-300">
            Отключенный текст
          </p>
        </div>
      </div>
    </div>
  );
}