"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ReactNode, useMemo } from "react"
import { useReducedMotion as useCustomReducedMotion } from "@/hooks/useReducedMotion"

interface PerformanceOptimizedProps {
  children: ReactNode
  className?: string
  willChange?: boolean
  transform3d?: boolean
}

/**
 * Компонент с оптимизированными анимациями для лучшей производительности
 */
export function PerformanceOptimized({ 
  children, 
  className = "",
  willChange = true,
  transform3d = true
}: PerformanceOptimizedProps) {
  const prefersReducedMotion = useCustomReducedMotion()
  
  const optimizedStyle = useMemo(() => ({
    willChange: willChange ? 'transform, opacity' : 'auto',
    transform: transform3d ? 'translateZ(0)' : 'none',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000
  }), [willChange, transform3d])

  return (
    <motion.div
      className={className}
      style={optimizedStyle}
      initial={prefersReducedMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 20 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
      }}
      transition={{ 
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Оптимизированный компонент для списков с виртуализацией
 */
export function OptimizedList({ 
  children, 
  className = "",
  itemHeight = 100,
  containerHeight = 400
}: PerformanceOptimizedProps & { 
  itemHeight?: number
  containerHeight?: number 
}) {
  const prefersReducedMotion = useCustomReducedMotion()

  return (
    <motion.div
      className={`overflow-auto ${className}`}
      style={{ 
        height: containerHeight,
        willChange: 'scroll-position'
      }}
      initial={prefersReducedMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 20 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
      }}
      transition={{ 
        duration: prefersReducedMotion ? 0.1 : 0.4,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Оптимизированный компонент для изображений с lazy loading
 */
export function OptimizedImage({ 
  children, 
  className = "",
  priority = false
}: PerformanceOptimizedProps & { priority?: boolean }) {
  const prefersReducedMotion = useCustomReducedMotion()

  return (
    <motion.div
      className={className}
      style={{
        willChange: priority ? 'transform, opacity' : 'auto',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden' as const
      }}
      initial={prefersReducedMotion ? { opacity: 0 } : { 
        opacity: 0, 
        scale: 0.95 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: "easeOut"
      }}
      whileHover={prefersReducedMotion ? {} : { 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Оптимизированный компонент для модальных окон
 */
export function OptimizedModal({ 
  children, 
  className = "" 
}: PerformanceOptimizedProps) {
  const prefersReducedMotion = useCustomReducedMotion()

  return (
    <motion.div
      className={className}
      style={{
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden' as const
      }}
      initial={prefersReducedMotion ? { opacity: 0 } : { 
        opacity: 0, 
        scale: 0.9,
        y: 20 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: 0 
      }}
      exit={prefersReducedMotion ? { opacity: 0 } : { 
        opacity: 0, 
        scale: 0.9,
        y: 20 
      }}
      transition={{ 
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Хук для оптимизации анимаций на основе производительности устройства
 */
export function usePerformanceOptimization() {
  const prefersReducedMotion = useCustomReducedMotion()
  
  // Определяем производительность устройства
  const isLowEndDevice = useMemo(() => {
    if (typeof window === 'undefined') return false
    
    // Проверяем количество ядер процессора
    const cores = navigator.hardwareConcurrency || 4
    const isLowCores = cores <= 2
    
    // Проверяем память (если доступно)
    const memory = (navigator as any).deviceMemory || 4
    const isLowMemory = memory <= 2
    
    // Проверяем соединение
    const connection = (navigator as any).connection
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g'
    )
    
    return isLowCores || isLowMemory || isSlowConnection
  }, [])

  return {
    prefersReducedMotion,
    isLowEndDevice,
    shouldReduceAnimations: prefersReducedMotion || isLowEndDevice,
    animationSettings: {
      duration: prefersReducedMotion || isLowEndDevice ? 0.1 : 0.3,
      ease: prefersReducedMotion || isLowEndDevice ? 'linear' : 'easeOut',
      stagger: prefersReducedMotion || isLowEndDevice ? 0 : 0.1,
      scale: prefersReducedMotion || isLowEndDevice ? 1 : 1.05,
      rotate: prefersReducedMotion || isLowEndDevice ? 0 : 5
    }
  }
}
