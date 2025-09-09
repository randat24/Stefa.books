'use client'

import { lazy, Suspense, ComponentType } from 'react'
import { cn } from '@/lib/cn'

// Ленивая загрузка иконок
const createLazyIcon = (iconName: string) => lazy(() => import('lucide-react').then(module => ({ 
  default: module[iconName as keyof typeof module] as ComponentType<any>
})))

interface LazyButtonProps {
  iconName?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 py-2',
  lg: 'h-12 px-6 text-lg',
}

export default function LazyButton({
  iconName,
  children,
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
}: LazyButtonProps) {
  const LazyIcon = iconName ? createLazyIcon(iconName) : null

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-2xl animate-spin" />
      )}
      
      {LazyIcon && !loading && (
        <Suspense fallback={<div className="w-4 h-4 bg-neutral-300 rounded animate-pulse" />}>
          <LazyIcon className="w-4 h-4" />
        </Suspense>
      )}
      
      {children}
    </button>
  )
}
