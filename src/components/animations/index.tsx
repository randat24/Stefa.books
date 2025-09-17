'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// Button Ripple Animation
interface ButtonRippleProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const ButtonRipple = ({ children, className = '', onClick, disabled }: ButtonRippleProps) => (
  <motion.button
    className={className}
    onClick={onClick}
    disabled={disabled}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
  >
    {children as any}
  </motion.button>
)

// Icon Hover Animation
interface IconHoverProps {
  children: ReactNode
  className?: string
}

export const IconHover = ({ children, className = '' }: IconHoverProps) => (
  <motion.div
    className={className}
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
  >
    {children as any}
  </motion.div>
)

// Text Underline Animation
interface TextUnderlineProps {
  children: ReactNode
  className?: string
}

export const TextUnderline = ({ children, className = '' }: TextUnderlineProps) => (
  <motion.span
    className={className}
    whileHover={{ 
      background: 'linear-gradient(to right, transparent 0%, currentColor 100%)',
      backgroundPosition: '0% 100%',
      backgroundSize: '100% 2px',
      backgroundRepeat: 'no-repeat'
    }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children as any}
  </motion.span>
)

// Page Transition
interface PageTransitionProps {
  children: ReactNode
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
    >
      {children as any}
    </motion.div>
  )
}

// Form Animation Components
interface FormSlideInProps {
  children: ReactNode
  className?: string
}

export const FormSlideIn = ({ children, className = '' }: FormSlideInProps) => (
  <motion.div
    className={className}
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children as any}
  </motion.div>
)

interface FormFadeInProps {
  children: ReactNode
  className?: string
}

export const FormFadeIn = ({ children, className = '' }: FormFadeInProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    {children as any}
  </motion.div>
)

interface StaggerContainerProps {
  children: ReactNode
  className?: string
}

export const StaggerContainer = ({ children, className = '' }: StaggerContainerProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }}
  >
    {children as any}
  </motion.div>
)

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
  >
    {children as any}
  </motion.div>
)

// Loading Skeleton Components
interface BookListSkeletonProps {
  count?: number
}

export const BookListSkeleton = ({ count = 8 }: BookListSkeletonProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="bg-neutral-200 rounded-lg h-80 animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      />
    ))}
  </div>
)

export const BookDetailSkeleton = () => (
  <motion.div
    className="max-w-4xl mx-auto p-6 space-y-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="bg-neutral-200 rounded-lg h-64 animate-pulse" />
    <div className="space-y-4">
      <div className="bg-neutral-200 rounded h-8 w-3/4 animate-pulse" />
      <div className="bg-neutral-200 rounded h-4 w-1/2 animate-pulse" />
      <div className="bg-neutral-200 rounded h-4 w-full animate-pulse" />
      <div className="bg-neutral-200 rounded h-4 w-4/5 animate-pulse" />
    </div>
  </motion.div>
)

export const FormSkeleton = () => (
  <motion.div
    className="space-y-4 max-w-md mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="bg-neutral-200 rounded h-4 w-1/3 animate-pulse" />
        <div className="bg-neutral-200 rounded h-10 w-full animate-pulse" />
      </div>
    ))}
  </motion.div>
)

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export const TableSkeleton = ({ rows = 5 }: TableSkeletonProps) => (
  <motion.div
    className="space-y-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="bg-neutral-200 rounded h-12 w-full animate-pulse" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-neutral-100 rounded h-16 w-full animate-pulse" />
    ))}
  </motion.div>
)

export const ProfileSkeleton = () => (
  <motion.div
    className="max-w-md mx-auto space-y-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex items-center space-x-4">
      <div className="bg-neutral-200 rounded-2xl h-20 w-20 animate-pulse" />
      <div className="space-y-2">
        <div className="bg-neutral-200 rounded h-6 w-32 animate-pulse" />
        <div className="bg-neutral-200 rounded h-4 w-24 animate-pulse" />
      </div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-neutral-200 rounded h-12 w-full animate-pulse" />
      ))}
    </div>
  </motion.div>
)

// Additional animation components
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <motion.div
      className={`animate-spin rounded-2xl border-b-2 border-neutral-900 ${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}

interface FormNotificationProps {
  children: ReactNode
  className?: string
}

export const FormNotification = ({ children, className = '' }: FormNotificationProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children as any}
  </motion.div>
)

interface FieldValidationProps {
  children: ReactNode
  className?: string
}

export const FieldValidation = ({ children, className = '' }: FieldValidationProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children as any}
  </motion.div>
)

interface AnimatedSubmitButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const AnimatedSubmitButton = ({ children, className = '', onClick, disabled }: AnimatedSubmitButtonProps) => (
  <motion.button
    className={className}
    onClick={onClick}
    disabled={disabled}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
  >
    {children as any}
  </motion.button>
)

interface FormProgressProps {
  progress: number
  className?: string
}

export const FormProgress = ({ progress, className = '' }: FormProgressProps) => (
  <motion.div
    className={className}
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  />
)

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export const AnimatedCheckbox = ({ checked, onChange, label, className = '' }: AnimatedCheckboxProps) => (
  <motion.label
    className={`flex items-center space-x-2 cursor-pointer ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.input
      type="checkbox"
      checked={checked}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
      className="w-4 h-4"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    />
    {label && <span>{label}</span>}
  </motion.label>
)