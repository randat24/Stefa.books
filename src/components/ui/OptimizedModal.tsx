'use client'

import { memo, useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface OptimizedModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventScroll?: boolean
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

const OptimizedModal = memo(function OptimizedModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
}: OptimizedModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Обработка клавиши Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose()
    }
  }, [onClose, closeOnEscape])

  // Обработка клика по overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }, [onClose, closeOnOverlayClick])

  // Обработка клика по кнопке закрытия
  const handleCloseClick = useCallback(() => {
    onClose()
  }, [onClose])

  // Эффекты для управления модальным окном
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущий активный элемент
      previousActiveElement.current = document.activeElement as HTMLElement
      
      // Блокируем скролл
      if (preventScroll) {
        document.body.style.overflow = 'hidden'
      }
      
      // Добавляем обработчик клавиатуры
      document.addEventListener('keydown', handleKeyDown)
      
      // Фокусируемся на модальном окне
      if (modalRef.current) {
        modalRef.current.focus()
      }
    } else {
      // Восстанавливаем скролл
      if (preventScroll) {
        document.body.style.overflow = ''
      }
      
      // Удаляем обработчик клавиатуры
      document.removeEventListener('keydown', handleKeyDown)
      
      // Возвращаем фокус
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }

    return () => {
      if (preventScroll) {
        document.body.style.overflow = ''
      }
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, preventScroll, handleKeyDown])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full',
          modalSizes[size],
          className
        )}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            {title && (
              <h2 id="modal-title" className="text-body-lg font-semibold text-neutral-900">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <PerformanceButton
                variant="ghost"
                size="sm"
                onClick={handleCloseClick}
                className="p-2"
                aria-label="Закрити модальне вікно"
              >
                <X className="w-4 h-4" />
              </PerformanceButton>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
})

export default OptimizedModal
