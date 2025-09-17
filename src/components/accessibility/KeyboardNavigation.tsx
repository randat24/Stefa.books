'use client';

import { useEffect, useRef , ReactNode } from 'react';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
  onEscape?: () => void;
  trapFocus?: boolean;
}

/**
 * Компонент для улучшения навигации с клавиатуры
 * Обеспечивает поддержку Tab, Enter, Escape и стрелок
 */
export function KeyboardNavigation({ 
  children, 
  className = '',
  onEscape,
  trapFocus = false 
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement | null | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const activeElement = document.activeElement as HTMLElement;

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            onEscape();
            event.preventDefault();
          }
          break;

        case 'Tab':
          if (trapFocus && focusableElements.length > 0) {
            if (event.shiftKey) {
              // Shift + Tab
              if (activeElement === firstElement) {
                lastElement?.focus();
                event.preventDefault();
              }
            } else {
              // Tab
              if (activeElement === lastElement) {
                firstElement?.focus();
                event.preventDefault();
              }
            }
          }
          break;

        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = Array.from(focusableElements).indexOf(activeElement) + 1;
          const nextElement = focusableElements[nextIndex] as HTMLElement;
          if (nextElement) {
            nextElement.focus();
          } else if (trapFocus) {
            firstElement?.focus();
          }
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = Array.from(focusableElements).indexOf(activeElement) - 1;
          const prevElement = focusableElements[prevIndex] as HTMLElement;
          if (prevElement) {
            prevElement.focus();
          } else if (trapFocus) {
            lastElement?.focus();
          }
          break;

        case 'Enter':
        case ' ':
          if (activeElement && activeElement !== document.body) {
            if (activeElement.tagName === 'BUTTON' || activeElement.getAttribute('role') === 'button') {
              activeElement.click();
              event.preventDefault();
            }
          }
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [onEscape, trapFocus]);

  return (
    <div 
      ref={containerRef}
      className={className}
      role="group"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

/**
 * Хук для управления фокусом
 */
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null | null>(null);

  const focusFirst = () => {
    if (focusRef.current) {
      const focusableElement = focusRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      focusableElement?.focus();
    }
  };

  const focusLast = () => {
    if (focusRef.current) {
      const focusableElements = focusRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      lastElement?.focus();
    }
  };

  const focusElement = (selector: string) => {
    if (focusRef.current) {
      const element = focusRef.current.querySelector(selector) as HTMLElement;
      element?.focus();
    }
  };

  return {
    focusRef,
    focusFirst,
    focusLast,
    focusElement
  };
}

/**
 * Компонент для скрытого текста для screen readers
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * Компонент для объявления изменений для screen readers
 */
export function LiveRegion({ 
  children, 
  politeness = 'polite' 
}: { 
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
}) {
  return (
    <div 
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}
