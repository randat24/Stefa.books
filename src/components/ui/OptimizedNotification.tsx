'use client'

import { memo, useCallback, useEffect, useState, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
  className?: string
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const notificationStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const Notification = memo(function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className = '',
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleClose = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Время для анимации выхода
  }, [id, onClose])

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(handleClose, duration)
    }
  }, [duration, handleClose])

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Автоматическое закрытие
    if (duration > 0) {
      timeoutRef.current = setTimeout(handleClose, duration)
    }

    return () => {
      clearTimeout(timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [duration, handleClose])

  const Icon = notificationIcons[type]

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border shadow-lg transition-all duration-300 transform',
        notificationStyles[type],
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {message && (
            <p className="text-body-sm mt-1 opacity-90">{message}</p>
          )}
        </div>
        
        <PerformanceButton
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="p-1 flex-shrink-0"
          aria-label="Закрити сповіщення"
        >
          <X className="w-4 h-4" />
        </PerformanceButton>
      </div>
    </div>
  )
})

interface NotificationContainerProps {
  notifications: NotificationProps[]
  onClose: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

const NotificationContainer = memo(function NotificationContainer({
  notifications,
  onClose,
  position = 'top-right',
  className = '',
}: NotificationContainerProps) {
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed z-50 space-y-2 max-w-sm w-full',
        positionStyles[position],
        className
      )}
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
})

// Хук для управления уведомлениями
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = useCallback((notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = {
      ...notification,
      id,
      onClose: () => {}, // Будет заменено в компоненте
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  }
}

export default NotificationContainer
export { Notification }
