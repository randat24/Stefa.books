'use client'

import { memo, forwardRef, useCallback, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface OptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  ripple?: boolean
}

const OptimizedButton = forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    ripple = true,
    children,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const [isRippling, setIsRippling] = useState(false)

    // Ripple effect
    const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || loading || disabled) return

      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const rippleElement = document.createElement('span')
      rippleElement.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
      `

      // Add animation keyframes if not exists
      if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style')
        style.id = 'ripple-animation'
        style.textContent = `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `
        document.head.appendChild(style)
      }

      button.appendChild(rippleElement)

      setTimeout(() => {
        rippleElement.remove()
      }, 600)
    }, [ripple, loading, disabled])

    // Handle click with ripple
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      handleRipple(e)
      onClick?.(e)
    }, [handleRipple, onClick])

    // Variant styles
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    }

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    // Icon size based on button size
    const iconSize = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-95 transform transition-transform duration-150',
          
          // Variant styles
          variantStyles[variant],
          
          // Size styles
          sizeStyles[size],
          
          // Full width
          fullWidth && 'w-full',
          
          // Loading state
          loading && 'cursor-wait',
          
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 className={cn('animate-spin', iconSize[size], icon && 'mr-2')} />
        )}
        
        {/* Left icon */}
        {icon && iconPosition === 'left' && !loading && (
          <span className={cn(iconSize[size], children && 'mr-2')}>
            {icon}
          </span>
        )}
        
        {/* Button content */}
        {children}
        
        {/* Right icon */}
        {icon && iconPosition === 'right' && !loading && (
          <span className={cn(iconSize[size], children && 'ml-2')}>
            {icon}
          </span>
        )}
      </button>
    )
  }
)

OptimizedButton.displayName = 'OptimizedButton'

// Memoized version for performance
export const MemoizedButton = memo(OptimizedButton)

// Button group component
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'sm' | 'md' | 'lg'
}

export function ButtonGroup({ 
  children, 
  className,
  orientation = 'horizontal',
  spacing = 'md'
}: ButtonGroupProps) {
  const spacingStyles = {
    sm: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    md: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    lg: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4'
  }

  return (
    <div className={cn(
      'inline-flex',
      orientation === 'vertical' ? 'flex-col' : 'flex-row',
      spacingStyles[spacing],
      className
    )}>
      {children}
    </div>
  )
}

// Icon button component
interface IconButtonProps extends Omit<OptimizedButtonProps, 'children'> {
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const iconSize = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    return (
      <OptimizedButton
        ref={ref}
        className={cn(
          'p-2 rounded-2xl',
          className
        )}
        size={size}
        {...props}
      >
        <span className={iconSize[size]}>
          {props.icon}
        </span>
      </OptimizedButton>
    )
  }
)

IconButton.displayName = 'IconButton'

export default OptimizedButton
