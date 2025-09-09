'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { KeyboardNavigation } from './KeyboardNavigation';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

/**
 * Доступное модальное окно с поддержкой клавиатуры и screen readers
 */
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Размеры модального окна
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Управление фокусом
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущий активный элемент
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Показываем модальное окно с анимацией
      setIsVisible(true);
      
      // Фокусируемся на модальном окне
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      // Блокируем скролл body
      document.body.style.overflow = 'hidden';
    } else {
      // Возвращаем скролл
      document.body.style.overflow = 'unset';
      
      // Возвращаем фокус на предыдущий элемент
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Скрываем модальное окно с анимацией
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обработка Escape
  const handleEscape = () => {
    if (closeOnEscape) {
      onClose();
    }
  };

  // Обработка клика по overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Обработка клика по кнопке закрытия
  const handleCloseClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-300 ease-in-out
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      
      {/* Модальное окно */}
      <KeyboardNavigation
        trapFocus={true}
        onEscape={handleEscape}
        className={`
          relative bg-neutral-0 rounded-xl shadow-2xl w-full
          ${sizeClasses[size]}
          ${isVisible ? 'scale-100' : 'scale-95'}
          transition-transform duration-300 ease-in-out
          ${className}
        `}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className="focus:outline-none"
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 
              id="modal-title"
              className="text-body-lg font-semibold text-neutral-900"
            >
              {title}
            </h2>
            
            {showCloseButton && (
              <button
                onClick={handleCloseClick}
                className="
                  p-2 text-neutral-400 hover:text-neutral-600 
                  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                  rounded-lg transition-colors
                "
                aria-label="Закрити модальне вікно"
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          
          {/* Контент */}
          <div 
            id="modal-description"
            className="p-6"
          >
            {children}
          </div>
        </div>
      </KeyboardNavigation>
    </div>
  );
}

/**
 * Хук для управления модальными окнами
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

/**
 * Компонент для подтверждения действия
 */
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  variant = 'info'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-neutral-600">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              rounded-lg transition-colors
            "
            type="button"
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            className={`
              px-4 py-2 text-neutral-0
              focus:outline-none focus:ring-2 focus:ring-offset-2
              rounded-lg transition-colors
              ${variantClasses[variant]}
            `}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
}
