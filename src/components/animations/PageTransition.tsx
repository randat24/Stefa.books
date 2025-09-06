"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

// Основной компонент для переходов между страницами
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 20 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
      }}
      exit={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: -20 
      }}
      transition={{ 
        duration: 0.4, 
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для появления контента с задержкой
export function DelayedContent({ 
  children, 
  delay = 0.2, 
  className = "" 
}: PageTransitionProps & { delay?: number }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 30 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
      }}
      transition={{ 
        duration: 0.6, 
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для секций с разными направлениями
export function SectionSlide({ 
  children, 
  direction = "up",
  className = "" 
}: PageTransitionProps & { direction?: "up" | "down" | "left" | "right" }) {
  const shouldReduceMotion = useReducedMotion()

  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  }

  const animateTo = {
    up: { y: 0, opacity: 1 },
    down: { y: 0, opacity: 1 },
    left: { x: 0, opacity: 1 },
    right: { x: 0, opacity: 1 }
  }

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : directionVariants[direction]}
      animate={shouldReduceMotion ? { opacity: 1 } : animateTo[direction]}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для модальных окон с backdrop
export function ModalTransition({ children, className = "" }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        scale: 0.8,
        y: 50 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: 0 
      }}
      exit={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        scale: 0.8,
        y: 50 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для backdrop модальных окон
export function BackdropTransition({ children, className = "" }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: shouldReduceMotion ? 0.1 : 0.3, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  )
}
