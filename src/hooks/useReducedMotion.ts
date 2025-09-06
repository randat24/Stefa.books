"use client"

import { useState, useEffect } from 'react'

/**
 * Хук для проверки настройки prefers-reduced-motion пользователя
 * Возвращает true, если пользователь предпочитает уменьшенную анимацию
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Проверяем настройку в CSS media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Устанавливаем начальное значение
    setPrefersReducedMotion(mediaQuery.matches)

    // Слушаем изменения настройки
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Добавляем слушатель
    mediaQuery.addEventListener('change', handleChange)

    // Очищаем слушатель при размонтировании
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Хук для получения настроек анимации с учетом prefers-reduced-motion
 */
export function useAnimationSettings() {
  const prefersReducedMotion = useReducedMotion()

  return {
    prefersReducedMotion,
    // Базовые настройки анимации
    duration: prefersReducedMotion ? 0.1 : 0.3,
    ease: prefersReducedMotion ? 'linear' : 'easeOut',
    // Настройки для разных типов анимаций
    microAnimations: {
      duration: prefersReducedMotion ? 0.1 : 0.2,
      scale: prefersReducedMotion ? 1 : 1.05,
      rotate: prefersReducedMotion ? 0 : 5
    },
    pageTransitions: {
      duration: prefersReducedMotion ? 0.1 : 0.4,
      y: prefersReducedMotion ? 0 : 20
    },
    formAnimations: {
      duration: prefersReducedMotion ? 0.1 : 0.3,
      stagger: prefersReducedMotion ? 0 : 0.1
    }
  }
}
