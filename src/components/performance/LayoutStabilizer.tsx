'use client'

import { useEffect, useState } from 'react'

// Component to prevent layout shifts by reserving space for dynamic content
interface LayoutStabilizerProps {
  width?: number | string
  height?: number | string
  aspectRatio?: string
  minHeight?: number | string
  className?: string
  children?: React.ReactNode
  loading?: boolean
  placeholder?: React.ReactNode
}

export default function LayoutStabilizer({
  width,
  height,
  aspectRatio,
  minHeight,
  className = '',
  children,
  loading = false,
  placeholder
}: LayoutStabilizerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerStyle: React.CSSProperties = {
    width,
    height,
    minHeight,
    aspectRatio
  }

  // Show placeholder during SSR and loading states
  if (!mounted || loading) {
    return (
      <div 
        className={`${className}`}
        style={containerStyle}
      >
        {placeholder || (
          <div className="w-full h-full bg-neutral-200 animate-pulse rounded" />
        )}
      </div>
    )
  }

  return (
    <div 
      className={className}
      style={containerStyle}
    >
      {children}
    </div>
  )
}

// Specialized components for common use cases
export function BookCardStabilizer({ 
  children, 
  loading = false 
}: { 
  children?: React.ReactNode
  loading?: boolean 
}) {
  return (
    <LayoutStabilizer
      width={280}
      height={420}
      className="rounded-lg overflow-hidden"
      loading={loading}
      placeholder={
        <div className="w-full h-full bg-neutral-200 animate-pulse">
          <div className="h-2/3 bg-neutral-300"></div>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-neutral-300 rounded w-3/4"></div>
            <div className="h-3 bg-neutral-300 rounded w-1/2"></div>
            <div className="h-3 bg-neutral-300 rounded w-2/3"></div>
          </div>
        </div>
      }
    >
      {children}
    </LayoutStabilizer>
  )
}

export function HeroSectionStabilizer({ 
  children, 
  loading = false 
}: { 
  children?: React.ReactNode
  loading?: boolean 
}) {
  return (
    <LayoutStabilizer
      minHeight="60vh"
      className="w-full"
      loading={loading}
      placeholder={
        <div className="w-full h-full bg-gradient-to-r from-neutral-200 to-neutral-300 animate-pulse">
          <div className="container mx-auto px-6 h-full flex items-center">
            <div className="w-1/2 space-y-4">
              <div className="h-12 bg-white/30 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-full"></div>
              <div className="h-4 bg-white/20 rounded w-2/3"></div>
              <div className="h-10 bg-white/40 rounded w-48 mt-8"></div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </LayoutStabilizer>
  )
}

export function NavigationStabilizer({ 
  children, 
  loading = false 
}: { 
  children?: React.ReactNode
  loading?: boolean 
}) {
  return (
    <LayoutStabilizer
      height={64}
      className="w-full sticky top-0 z-50"
      loading={loading}
      placeholder={
        <div className="w-full h-full bg-white shadow-sm border-b animate-pulse">
          <div className="container mx-auto px-6 h-full flex items-center justify-between">
            <div className="h-8 bg-neutral-300 rounded w-32"></div>
            <div className="flex space-x-4">
              <div className="h-8 bg-neutral-300 rounded w-20"></div>
              <div className="h-8 bg-neutral-300 rounded w-20"></div>
              <div className="h-8 bg-neutral-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </LayoutStabilizer>
  )
}

// Hook to measure and prevent layout shifts
export function useLayoutStabilization(elementRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [elementRef])

  return dimensions
}