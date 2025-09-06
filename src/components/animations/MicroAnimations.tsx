"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

interface MicroAnimationsProps {
  children: ReactNode
  className?: string
}

// Анимация для кнопок с ripple эффектом
export function ButtonRipple({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для карточек с улучшенным hover
export function CardHover({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      whileHover={shouldReduceMotion ? {} : { 
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={shouldReduceMotion ? {} : { 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для иконок
export function IconHover({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.1,
        rotate: 5,
        transition: { duration: 0.2 }
      }}
      whileTap={shouldReduceMotion ? {} : { 
        scale: 0.9,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для текста с подчеркиванием
export function TextUnderline({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-brand-yellow"
        initial={{ width: 0 }}
        whileHover={shouldReduceMotion ? {} : { 
          width: "100%",
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      />
    </motion.div>
  )
}

// Анимация для модальных окон
export function ModalAnimation({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        scale: 0.9, 
        y: 20 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0 
      }}
      exit={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        scale: 0.9, 
        y: 20 
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

// Анимация для списков с stagger эффектом
export function StaggeredItem({ 
  children, 
  index = 0, 
  className = "" 
}: MicroAnimationsProps & { index?: number }) {
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
      transition={{ 
        duration: 0.5, 
        delay: shouldReduceMotion ? 0 : index * 0.1,
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

// Анимация для уведомлений
export function NotificationSlide({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        x: 300 
      }}
      animate={{ 
        opacity: 1, 
        x: 0 
      }}
      exit={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        x: 300 
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

// Анимация для форм с валидацией
export function FormFieldAnimation({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 10 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
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

// Анимация для загрузки с пульсацией
export function PulseAnimation({ children, className = "" }: MicroAnimationsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      animate={shouldReduceMotion ? {} : { 
        scale: [1, 1.05, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  )
}
