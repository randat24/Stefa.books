"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ReactNode, useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

interface FormFeedbackProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  className?: string
  autoHide?: boolean
  duration?: number
}

// Компонент для уведомлений с анимацией
export function FormNotification({ 
  type, 
  message, 
  className = "", 
  autoHide = true,
  duration = 5000 
}: FormFeedbackProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoHide, duration])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }

  const Icon = icons[type]

  if (!isVisible) return null

  return (
    <motion.div
      className={`flex items-center gap-3 p-4 rounded-lg border ${colors[type]} ${className}`}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: -20, 
        scale: 0.95 
      }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1 
      }}
      exit={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: -20, 
        scale: 0.95 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut" 
      }}
    >
      <motion.div
        initial={shouldReduceMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.2, 
          delay: 0.1 
        }}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
      </motion.div>
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  )
}

// Компонент для валидации полей формы
interface FieldValidationProps {
  isValid: boolean
  errorMessage?: string
  successMessage?: string
  className?: string
}

export function FieldValidation({ 
  isValid, 
  errorMessage, 
  successMessage, 
  className = "" 
}: FieldValidationProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!errorMessage && !successMessage) return null

  return (
    <motion.div
      className={`flex items-center gap-2 mt-1 ${className}`}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: -10 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
      }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut" 
      }}
    >
      {isValid && successMessage ? (
        <>
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </motion.div>
          <span className="text-sm text-green-600">{successMessage}</span>
        </>
      ) : (
        <>
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <XCircle className="h-4 w-4 text-red-600" />
          </motion.div>
          <span className="text-sm text-red-600">{errorMessage}</span>
        </>
      )}
    </motion.div>
  )
}

// Компонент для анимированной кнопки отправки
interface SubmitButtonProps {
  isLoading: boolean
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedSubmitButton({ 
  isLoading, 
  children, 
  className = "",
  onClick 
}: SubmitButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      disabled={isLoading}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={shouldReduceMotion ? {} : { 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={isLoading ? { 
          opacity: 0.7 
        } : { 
          opacity: 1 
        }}
        transition={{ duration: 0.2 }}
      >
        {isLoading && (
          <motion.div
            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        )}
        {children}
      </motion.div>
      
      {/* Ripple эффект при клике */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ 
            scale: 1, 
            opacity: 1,
            transition: { duration: 0.1 }
          }}
        />
      )}
    </motion.button>
  )
}

// Компонент для прогресс-бара формы
interface FormProgressProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function FormProgress({ 
  currentStep, 
  totalSteps, 
  className = "" 
}: FormProgressProps) {
  const shouldReduceMotion = useReducedMotion()
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Крок {currentStep} з {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-brand-yellow h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: shouldReduceMotion ? 0.1 : 0.5, 
            ease: "easeOut" 
          }}
        />
      </div>
    </div>
  )
}

// Компонент для анимированного чекбокса
interface AnimatedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export function AnimatedCheckbox({ 
  checked, 
  onChange, 
  label, 
  className = "" 
}: AnimatedCheckboxProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.label
      className={`flex items-center gap-3 cursor-pointer ${className}`}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <motion.div
        className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
          checked 
            ? 'bg-brand-yellow border-brand-yellow' 
            : 'border-gray-300'
        }`}
        animate={checked ? { 
          scale: [1, 1.1, 1],
          transition: { duration: 0.2 }
        } : {}}
      >
        {checked && (
          <motion.svg
            className="w-3 h-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            initial={shouldReduceMotion ? { opacity: 1 } : { 
              pathLength: 0, 
              opacity: 0 
            }}
            animate={{ 
              pathLength: 1, 
              opacity: 1 
            }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut" 
            }}
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </motion.div>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </motion.label>
  )
}
