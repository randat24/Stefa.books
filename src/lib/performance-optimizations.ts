/**
 * Дополнительные оптимизации производительности
 */

import React from 'react';

/**
 * Хук для измерения производительности компонента
 */
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  const renderCount = React.useRef(0);
  const startTime = React.useRef<number>(0);

  React.useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();
  });

  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    monitor.mark(`${componentName}-render-${renderCount.current}`);
    monitor.measure(`${componentName}-render-time`, `${componentName}-render-${renderCount.current}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    getRenderTime: (renderNumber: number) => 
      monitor.getMeasure(`${componentName}-render-time`)
  };
}

/**
 * Оптимизация изображений
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'avif';
    blur?: number;
  } = {}
): string {
  const {
    width,
    height,
    quality = 75,
    format = 'webp',
    blur
  } = options;

  // Если это Cloudinary URL
  if (url.includes('cloudinary.com')) {
    const baseUrl = url.split('/upload/')[0];
    const imagePath = url.split('/upload/')[1];
    
    let transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    if (blur) transformations.push(`e_blur:${blur}`);
    
    const transformString = transformations.join(',');
    return `${baseUrl}/upload/${transformString}/${imagePath}`;
  }

  return url;
}

/**
 * Предзагрузка ресурсов
 */
export function preloadResource(
  url: string,
  type: 'image' | 'script' | 'style' | 'font' = 'image'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${url}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Предзагрузка изображений
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(url => preloadResource(url, 'image')));
}

/**
 * Ленивая загрузка изображений
 */
export function lazyLoadImages(
  selector: string = 'img[data-src]',
  options: IntersectionObserverInit = {}
): void {
  if (typeof window === 'undefined') return;

  if (!('IntersectionObserver' in window)) {
    // Fallback для старых браузеров
    const images = document.querySelectorAll(selector);
    images.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options
  });

  const images = document.querySelectorAll(selector);
  images.forEach(img => imageObserver.observe(img));
}

/**
 * Оптимизация анимаций
 */
export function optimizeAnimations(): void {
  if (typeof window === 'undefined') return;

  // Отключаем анимации для пользователей с prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Оптимизация скролла
 */
export function optimizeScroll(): void {
  if (typeof window === 'undefined') return;

  let ticking = false;

  const updateScrollPosition = () => {
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });
}

/**
 * Оптимизация ресайза
 */
export function optimizeResize(): void {
  if (typeof window === 'undefined') return;

  if (!('ResizeObserver' in window)) return;

  let ticking = false;

  const updateLayout = () => {
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateLayout);
      ticking = true;
    }
  };

  const resizeObserver = new ResizeObserver(requestTick);
  resizeObserver.observe(document.body);
}

/**
 * Инициализация всех оптимизаций
 */
export function initializePerformanceOptimizations(): void {
  if (typeof window === 'undefined') return;

  optimizeAnimations();
  optimizeScroll();
  optimizeResize();
  lazyLoadImages();
}

// Импорт PerformanceMonitor из основного файла
import { PerformanceMonitor } from './performance';
