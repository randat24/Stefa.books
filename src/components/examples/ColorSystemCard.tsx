'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ColorSystemCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

export function ColorSystemCard({
  children,
  variant = 'default',
  size = 'md',
  hover = false,
  className
}: ColorSystemCardProps) {
  const baseClasses = cn(
    'rounded-xl transition-all duration-200',
    hover && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
    className
  );

  const variantClasses = {
    default: 'bg-neutral-0 border border-neutral-200 shadow-sm',
    elevated: 'bg-neutral-0 border border-neutral-200 shadow-md',
    outlined: 'bg-neutral-0 border-2 border-neutral-300 shadow-none',
    filled: 'bg-neutral-50 border border-neutral-200 shadow-sm'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size]
      )}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Примеры использования
export function ColorSystemCardExamples() {
  return (
    <div className="space-y-8 p-6 bg-neutral-50 rounded-xl">
      <h2 className="text-h2 text-neutral-900">Color System Card Examples</h2>
      
      {/* Основные варианты */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Основные варианты</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorSystemCard variant="default">
            <h4 className="text-h4 text-neutral-900 mb-2">Default Card</h4>
            <p className="text-readable text-neutral-600">
              Стандартная карточка с тонкой границей и тенью
            </p>
          </ColorSystemCard>
          
          <ColorSystemCard variant="elevated">
            <h4 className="text-h4 text-neutral-900 mb-2">Elevated Card</h4>
            <p className="text-readable text-neutral-600">
              Приподнятая карточка с более выраженной тенью
            </p>
          </ColorSystemCard>
          
          <ColorSystemCard variant="outlined">
            <h4 className="text-h4 text-neutral-900 mb-2">Outlined Card</h4>
            <p className="text-readable text-neutral-600">
              Карточка только с границей, без тени
            </p>
          </ColorSystemCard>
          
          <ColorSystemCard variant="filled">
            <h4 className="text-h4 text-neutral-900 mb-2">Filled Card</h4>
            <p className="text-readable text-neutral-600">
              Заполненная карточка с фоновым цветом
            </p>
          </ColorSystemCard>
        </div>
      </div>

      {/* Размеры */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Размеры</h3>
        <div className="space-y-4">
          <ColorSystemCard variant="default" size="sm">
            <h4 className="text-h5 text-neutral-900 mb-2">Small Card</h4>
            <p className="text-body-sm text-neutral-600">
              Компактная карточка для краткой информации
            </p>
          </ColorSystemCard>
          
          <ColorSystemCard variant="default" size="md">
            <h4 className="text-h4 text-neutral-900 mb-2">Medium Card</h4>
            <p className="text-readable text-neutral-600">
              Стандартная карточка для основного контента
            </p>
          </ColorSystemCard>
          
          <ColorSystemCard variant="default" size="lg">
            <h4 className="text-h3 text-neutral-900 mb-2">Large Card</h4>
            <p className="text-readable text-neutral-600">
              Просторная карточка для детального контента
            </p>
          </ColorSystemCard>
        </div>
      </div>

      {/* Интерактивные карточки */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Интерактивные карточки</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorSystemCard variant="default" hover>
            <h4 className="text-h4 text-neutral-900 mb-2">Hover Card</h4>
            <p className="text-readable text-neutral-600">
              Наведите для эффекта
            </p>
          </ColorSystemCard>
          
          <ColorSystemCard variant="elevated" hover>
            <h4 className="text-h4 text-neutral-900 mb-2">Interactive</h4>
            <p className="text-readable text-neutral-600">
              Интерактивная карточка
            </p>
          </ColorSystemCard>
          
          <ColorSystemCard variant="outlined" hover>
            <h4 className="text-h4 text-neutral-900 mb-2">Clickable</h4>
            <p className="text-readable text-neutral-600">
              Кликабельная карточка
            </p>
          </ColorSystemCard>
        </div>
      </div>

      {/* Семантические карточки */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Семантические карточки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-success-50 border border-success-200 rounded-xl p-6">
            <h4 className="text-h4 text-success-900 mb-2">Success Card</h4>
            <p className="text-readable text-success-700">
              Успешная операция выполнена
            </p>
          </div>
          
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-6">
            <h4 className="text-h4 text-warning-900 mb-2">Warning Card</h4>
            <p className="text-readable text-warning-700">
              Внимание! Проверьте данные
            </p>
          </div>
          
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h4 className="text-h4 text-error-900 mb-2">Error Card</h4>
            <p className="text-readable text-error-700">
              Произошла ошибка при обработке
            </p>
          </div>
          
          <div className="bg-info-50 border border-info-200 rounded-xl p-6">
            <h4 className="text-h4 text-info-900 mb-2">Info Card</h4>
            <p className="text-readable text-info-700">
              Полезная информация для вас
            </p>
          </div>
        </div>
      </div>

      {/* Поверхности */}
      <div className="space-y-4">
        <h3 className="text-h3 text-neutral-800">Поверхности</h3>
        <div className="space-y-4">
          <div className="surface p-6 rounded-xl">
            <h4 className="text-h4 text-neutral-900 mb-2">Surface</h4>
            <p className="text-readable text-neutral-600">
              Основная поверхность с семантическим классом
            </p>
          </div>
          
          <div className="surface-subtle p-6 rounded-xl">
            <h4 className="text-h4 text-neutral-900 mb-2">Surface Subtle</h4>
            <p className="text-readable text-neutral-600">
              Приглушенная поверхность
            </p>
          </div>
          
          <div className="surface-raised p-6 rounded-xl">
            <h4 className="text-h4 text-neutral-900 mb-2">Surface Raised</h4>
            <p className="text-readable text-neutral-600">
              Приподнятая поверхность с тенью
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}