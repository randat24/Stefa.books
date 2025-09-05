/**
 * Утилиты для адаптивного дизайна
 */

/**
 * Breakpoints для различных устройств
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

/**
 * Типы breakpoints
 */
export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Проверка, является ли устройство мобильным
 */
export function isMobile(width: number): boolean {
  return width < BREAKPOINTS.md;
}

/**
 * Проверка, является ли устройство планшетом
 */
export function isTablet(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Проверка, является ли устройство десктопом
 */
export function isDesktop(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * Получение текущего breakpoint по ширине экрана
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
}

/**
 * Проверка, поддерживает ли устройство touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Проверка, поддерживает ли устройство hover
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Проверка, предпочитает ли пользователь уменьшенную анимацию
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Проверка, предпочитает ли пользователь темную тему
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Получение размера viewport
 */
export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * Получение размера экрана
 */
export function getScreenSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  
  return {
    width: window.screen.width,
    height: window.screen.height
  };
}

/**
 * Проверка, является ли устройство Retina
 */
export function isRetina(): boolean {
  if (typeof window === 'undefined') return false;
  return window.devicePixelRatio > 1;
}

/**
 * Получение плотности пикселей
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio;
}

/**
 * Проверка, поддерживает ли браузер определенные CSS свойства
 */
export function supportsCSSProperty(property: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const element = document.createElement('div');
  return property in element.style;
}

/**
 * Проверка, поддерживает ли браузер CSS Grid
 */
export function supportsCSSGrid(): boolean {
  return supportsCSSProperty('grid-template-columns');
}

/**
 * Проверка, поддерживает ли браузер CSS Flexbox
 */
export function supportsFlexbox(): boolean {
  return supportsCSSProperty('flex-direction');
}

/**
 * Проверка, поддерживает ли браузер CSS Custom Properties
 */
export function supportsCustomProperties(): boolean {
  return supportsCSSProperty('--custom-property');
}

/**
 * Получение безопасных зон для мобильных устройств
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
  };
}

/**
 * Установка CSS переменных для безопасных зон
 */
export function setSafeAreaInsets(): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const insets = getSafeAreaInsets();
  
  root.style.setProperty('--safe-area-inset-top', `${insets.top}px`);
  root.style.setProperty('--safe-area-inset-right', `${insets.right}px`);
  root.style.setProperty('--safe-area-inset-bottom', `${insets.bottom}px`);
  root.style.setProperty('--safe-area-inset-left', `${insets.left}px`);
}

/**
 * Получение ориентации устройства
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'landscape';
  
  const { width, height } = getViewportSize();
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Проверка, является ли устройство в портретной ориентации
 */
export function isPortrait(): boolean {
  return getOrientation() === 'portrait';
}

/**
 * Проверка, является ли устройство в альбомной ориентации
 */
export function isLandscape(): boolean {
  return getOrientation() === 'landscape';
}

/**
 * Получение информации об устройстве
 */
export function getDeviceInfo(): {
  type: 'mobile' | 'tablet' | 'desktop';
  breakpoint: Breakpoint;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  isRetina: boolean;
  pixelRatio: number;
  supportsHover: boolean;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
} {
  const { width } = getViewportSize();
  
  return {
    type: isMobile(width) ? 'mobile' : isTablet(width) ? 'tablet' : 'desktop',
    breakpoint: getCurrentBreakpoint(width),
    orientation: getOrientation(),
    isTouch: isTouchDevice(),
    isRetina: isRetina(),
    pixelRatio: getDevicePixelRatio(),
    supportsHover: supportsHover(),
    prefersReducedMotion: prefersReducedMotion(),
    prefersDarkMode: prefersDarkMode()
  };
}

/**
 * Хук для отслеживания изменений размера экрана
 */
export function useViewportSize() {
  const [size, setSize] = React.useState(getViewportSize);
  
  React.useEffect(() => {
    const updateSize = () => {
      setSize(getViewportSize());
    };
    
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return size;
}

/**
 * Хук для отслеживания изменений ориентации
 */
export function useOrientation() {
  const [orientation, setOrientation] = React.useState(getOrientation);
  
  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(getOrientation());
    };
    
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);
  
  return orientation;
}

/**
 * Хук для отслеживания изменений breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('xl');
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(getCurrentBreakpoint(window.innerWidth));
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}

// Импорт React для хуков
import React from 'react';
