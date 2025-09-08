'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

// Create fallback components that don't use Framer Motion
const SimpleSkeleton = ({ className = '', children }: { className?: string; children?: ReactNode }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
)

const SimpleSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div className={`animate-spin rounded-2xl border-b-2 border-gray-900 ${sizeClasses[size]} ${className}`} />
  )
}

// Dynamic imports for Framer Motion components - loaded only when needed
export const ButtonRipple = dynamic(
  () => import('./index').then(mod => ({ default: mod.ButtonRipple })),
  { 
    ssr: false,
    loading: () => <button className="inline-flex items-center justify-center"><SimpleSkeleton /></button>
  }
)

export const IconHover = dynamic(
  () => import('./index').then(mod => ({ default: mod.IconHover })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const TextUnderline = dynamic(
  () => import('./index').then(mod => ({ default: mod.TextUnderline })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const PageTransition = dynamic(
  () => import('./index').then(mod => ({ default: mod.PageTransition })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const FormSlideIn = dynamic(
  () => import('./index').then(mod => ({ default: mod.FormSlideIn })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const FormFadeIn = dynamic(
  () => import('./index').then(mod => ({ default: mod.FormFadeIn })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const StaggerContainer = dynamic(
  () => import('./index').then(mod => ({ default: mod.StaggerContainer })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const StaggerItem = dynamic(
  () => import('./index').then(mod => ({ default: mod.StaggerItem })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

// Most commonly used - skeleton components (with simpler fallbacks)
export const BookListSkeleton = dynamic(
  () => import('./index').then(mod => ({ default: mod.BookListSkeleton })),
  { 
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SimpleSkeleton key={i} className="bg-gray-200 rounded-lg h-80" />
        ))}
      </div>
    )
  }
)

export const BookDetailSkeleton = dynamic(
  () => import('./index').then(mod => ({ default: mod.BookDetailSkeleton })),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <SimpleSkeleton className="bg-gray-200 rounded-lg h-64" />
        <div className="space-y-4">
          <SimpleSkeleton className="bg-gray-200 rounded h-8 w-3/4" />
          <SimpleSkeleton className="bg-gray-200 rounded h-4 w-1/2" />
          <SimpleSkeleton className="bg-gray-200 rounded h-4 w-full" />
          <SimpleSkeleton className="bg-gray-200 rounded h-4 w-4/5" />
        </div>
      </div>
    )
  }
)

export const FormSkeleton = dynamic(
  () => import('./index').then(mod => ({ default: mod.FormSkeleton })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4 max-w-md mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SimpleSkeleton className="bg-gray-200 rounded h-4 w-1/3" />
            <SimpleSkeleton className="bg-gray-200 rounded h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }
)

export const TableSkeleton = dynamic(
  () => import('./index').then(mod => ({ default: mod.TableSkeleton })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <SimpleSkeleton className="bg-gray-200 rounded h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SimpleSkeleton key={i} className="bg-gray-100 rounded h-16 w-full" />
        ))}
      </div>
    )
  }
)

export const ProfileSkeleton = dynamic(
  () => import('./index').then(mod => ({ default: mod.ProfileSkeleton })),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <SimpleSkeleton className="bg-gray-200 rounded-2xl h-20 w-20" />
          <div className="space-y-2">
            <SimpleSkeleton className="bg-gray-200 rounded h-6 w-32" />
            <SimpleSkeleton className="bg-gray-200 rounded h-4 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SimpleSkeleton key={i} className="bg-gray-200 rounded h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }
)

export const LoadingSpinner = dynamic(
  () => import('./index').then(mod => ({ default: mod.LoadingSpinner })),
  { 
    ssr: false,
    loading: () => <SimpleSpinner />
  }
)

// Other animation components
export const FormNotification = dynamic(
  () => import('./index').then(mod => ({ default: mod.FormNotification })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const FieldValidation = dynamic(
  () => import('./index').then(mod => ({ default: mod.FieldValidation })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
)

export const AnimatedSubmitButton = dynamic(
  () => import('./index').then(mod => ({ default: mod.AnimatedSubmitButton })),
  { 
    ssr: false,
    loading: () => <button className="inline-flex items-center justify-center"><SimpleSkeleton /></button>
  }
)

export const FormProgress = dynamic(
  () => import('./index').then(mod => ({ default: mod.FormProgress })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton className="h-2 bg-gray-200 rounded" />
  }
)

export const AnimatedCheckbox = dynamic(
  () => import('./index').then(mod => ({ default: mod.AnimatedCheckbox })),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton className="w-4 h-4" />
  }
)