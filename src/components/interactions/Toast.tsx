"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Info, X, AlertTriangleIcon } from "lucide-react"

interface ToastProps {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-neutral-500" />
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-neutral-50 border-neutral-200"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`
            relative max-w-sm w-full ${getColors()} border rounded-lg shadow-lg
            p-4 pr-10 overflow-hidden
          `}
        >
          {/* Progress Bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-current/30"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />

          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {getIcon()}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h4
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-semibold text-neutral-900 text-sm"
              >
                {title}
              </motion.h4>
              
              {message && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-neutral-600 text-body-sm mt-1"
                >
                  {message}
                </motion.p>
              )}
            </div>

            <motion.button
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
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

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    title: string
    message?: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
}
