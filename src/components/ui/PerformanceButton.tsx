'use client'

import { useCallback, useState , ReactNode } from 'react';
import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PerformanceButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const buttonVariants = {
  default: 'bg-neutral-900 text-neutral-0 hover:bg-neutral-800 focus:ring-gray-500',
  outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-gray-500',
  ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-gray-500',
  destructive: 'bg-red-600 text-neutral-0 hover:bg-red-700 focus:ring-red-500',
  primary: 'bg-[var(--brand)] text-[#111827] hover:bg-[var(--brand-600)] focus:ring-[var(--brand)]' }

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg' }

const PerformanceButton = (function PerformanceButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left' }: PerformanceButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback(() => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }, [disabled, loading, onClick])

  const handleMouseDown = useCallback(() => {
    setIsPressed(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsPressed(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false)
  }, [])

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        isPressed && 'scale-95',
        loading && 'cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-2xl animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      <span className={cn(
        'truncate',
        loading && 'opacity-70'
      )}>
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  )
})

export default PerformanceButton
