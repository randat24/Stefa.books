"use client"

import { motion, useReducedMotion, PanInfo } from "framer-motion"
import { ReactNode, useState, useRef, useEffect } from "react"

interface MobileGesturesProps {
  children: ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

// Компонент для swipe жестов
export function Swipeable({ 
  children, 
  className = "",
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: MobileGesturesProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    if (shouldReduceMotion) return

    const { offset, velocity } = info
    const swipeThreshold = threshold

    // Определяем направление свайпа
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Горизонтальный свайп
      if (offset.x > swipeThreshold && velocity.x > 0) {
        onSwipeRight?.()
      } else if (offset.x < -swipeThreshold && velocity.x < 0) {
        onSwipeLeft?.()
      }
    } else {
      // Вертикальный свайп
      if (offset.y > swipeThreshold && velocity.y > 0) {
        onSwipeDown?.()
      } else if (offset.y < -swipeThreshold && velocity.y < 0) {
        onSwipeUp?.()
      }
    }
  }

  return (
    <motion.div
      className={className}
      drag={!shouldReduceMotion}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={isDragging ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : { 
        scale: 1,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}

// Компонент для pull-to-refresh
interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
  threshold?: number
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  className = "",
  threshold = 80
}: PullToRefreshProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const handleDrag = (event: any, info: PanInfo) => {
    if (shouldReduceMotion) return

    const { offset } = info
    if (offset.y > 0) {
      setPullDistance(Math.min(offset.y, threshold * 1.5))
      setIsPulling(true)
    }
  }

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (shouldReduceMotion) return

    const { offset, velocity } = info
    
    if (offset.y > threshold || velocity.y > 500) {
      setIsRefreshing(true)
      setPullDistance(0)
      setIsPulling(false)
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    } else {
      setPullDistance(0)
      setIsPulling(false)
    }
  }

  return (
    <motion.div
      className={`relative ${className}`}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ 
        y: shouldReduceMotion ? 0 : pullDistance * 0.5 
      }}
    >
      {/* Индикатор обновления */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
        animate={{
          opacity: isPulling || isRefreshing ? 1 : 0,
          y: isPulling || isRefreshing ? 0 : -20
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg">
          {isRefreshing ? (
            <motion.div
              className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          ) : (
            <motion.div
              className="w-5 h-5"
              animate={{ 
                y: [0, -4, 0],
                transition: { 
                  duration: 0.6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
              }}
            >
              ↓
            </motion.div>
          )}
          <span className="text-sm text-gray-600">
            {isRefreshing ? "Оновлення..." : "Потягніть для оновлення"}
          </span>
        </div>
      </motion.div>

      {children}
    </motion.div>
  )
}

// Компонент для жестов масштабирования
interface PinchZoomProps {
  children: ReactNode
  className?: string
  minScale?: number
  maxScale?: number
}

export function PinchZoom({ 
  children, 
  className = "",
  minScale = 0.5,
  maxScale = 3
}: PinchZoomProps) {
  const shouldReduceMotion = useReducedMotion()
  const [scale, setScale] = useState(1)

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.1}
      onWheel={(e) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setScale(prev => Math.max(minScale, Math.min(maxScale, prev + delta)))
      }}
      style={{ scale }}
      animate={{ scale }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

// Компонент для жестов поворота
interface RotateGestureProps {
  children: ReactNode
  className?: string
  onRotate?: (angle: number) => void
}

export function RotateGesture({ 
  children, 
  className = "",
  onRotate
}: RotateGestureProps) {
  const shouldReduceMotion = useReducedMotion()
  const [rotation, setRotation] = useState(0)
  const [isRotating, setIsRotating] = useState(false)

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={() => setIsRotating(true)}
      onDrag={(event, info) => {
        const { offset } = info
        const angle = (offset.x / 100) * 360
        setRotation(angle)
        onRotate?.(angle)
      }}
      onDragEnd={() => setIsRotating(false)}
      style={{ 
        rotate: rotation,
        scale: isRotating ? 1.05 : 1
      }}
      animate={{ 
        scale: isRotating ? 1.05 : 1,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}

// Компонент для жестов двойного тапа
interface DoubleTapProps {
  children: ReactNode
  className?: string
  onDoubleTap?: () => void
  delay?: number
}

export function DoubleTap({ 
  children, 
  className = "",
  onDoubleTap,
  delay = 300
}: DoubleTapProps) {
  const shouldReduceMotion = useReducedMotion()
  const [tapCount, setTapCount] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTap = () => {
    if (shouldReduceMotion) {
      onDoubleTap?.()
      return
    }

    setTapCount(prev => prev + 1)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (tapCount === 1) {
        setTapCount(0)
      }
    }, delay)

    if (tapCount === 1) {
      onDoubleTap?.()
      setTapCount(0)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      className={className}
      onTap={handleTap}
      whileTap={shouldReduceMotion ? {} : { 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}

// Компонент для жестов долгого нажатия
interface LongPressProps {
  children: ReactNode
  className?: string
  onLongPress?: () => void
  duration?: number
}

export function LongPress({ 
  children, 
  className = "",
  onLongPress,
  duration = 500
}: LongPressProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handlePressStart = () => {
    if (shouldReduceMotion) {
      onLongPress?.()
      return
    }

    setIsPressed(true)
    timeoutRef.current = setTimeout(() => {
      onLongPress?.()
    }, duration)
  }

  const handlePressEnd = () => {
    setIsPressed(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      className={className}
      onTapStart={handlePressStart}
      onTapCancel={handlePressEnd}
      onTap={handlePressEnd}
      animate={isPressed ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : { 
        scale: 1,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}
