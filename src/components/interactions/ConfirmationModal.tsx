"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { AnimatedButton } from "../forms/AnimatedButton"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: "warning" | "danger" | "info" | "success"
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Підтвердити",
  cancelText = "Скасувати",
  loading = false
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    }
  }

  const getConfirmVariant = () => {
    switch (type) {
      case "danger":
        return "destructive"
      case "success":
        return "primary"
      default:
        return "primary"
    }
  }

  const handleConfirm = () => {
    onConfirm()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
              >
                {getIcon()}
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold text-gray-900 mb-2"
              >
                {title}
              </motion.h3>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-6"
              >
                {message}
              </motion.p>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 justify-center"
              >
                <AnimatedButton
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </AnimatedButton>
                
                <AnimatedButton
                  variant={getConfirmVariant()}
                  onClick={handleConfirm}
                  loading={loading}
                >
                  {confirmText}
                </AnimatedButton>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
