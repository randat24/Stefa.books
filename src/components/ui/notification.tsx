"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
  className?: string
}

const notificationVariants = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    iconComponent: CheckCircle
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    iconComponent: AlertCircle
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    iconComponent: AlertTriangle
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    iconComponent: Info
  }
}

export function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className
}: NotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const variant = notificationVariants[type]
  const IconComponent = variant.iconComponent

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "relative max-w-sm w-full rounded-lg border shadow-lg p-4 pr-10 overflow-hidden",
            variant.bg,
            variant.border,
            className
          )}
        >
          {/* Progress Bar */}
          <motion.div
            className={cn("absolute bottom-0 left-0 h-1 rounded-full", variant.icon)}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />

          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className={cn("flex-shrink-0", variant.icon)}
            >
              <IconComponent className="w-5 h-5" />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h4
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={cn("font-semibold text-sm", variant.text)}
              >
                {title}
              </motion.h4>
              
              {message && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn("text-sm mt-1", variant.text, "opacity-80")}
                >
                  {message}
                </motion.p>
              )}
            </div>

            <motion.button
              onClick={handleClose}
              className={cn(
                "text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0",
                variant.text,
                "opacity-60 hover:opacity-100"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }>
  onClose: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  className?: string
}

export function NotificationContainer({ 
  notifications, 
  onClose, 
  position = 'top-right',
  className 
}: NotificationContainerProps) {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={cn("z-50 space-y-2", positionClasses[position], className)}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

export default Notification
