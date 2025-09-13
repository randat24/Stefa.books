"use client"

import { useMemo } from 'react'
import { toast as sonnerToast } from 'sonner'

export interface Toast {
  id?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id?: string | number) => void
}

// Unified toast hook that proxies to Sonner. Ensures a single consistent style site‑wide.
const useToast = (): ToastContextType => {
  // We don't maintain a parallel in-app queue anymore; Sonner handles rendering.
  const toasts: Toast[] = useMemo(() => [], [])

  const toast = ({ title, description, variant = 'default', duration }: Omit<Toast, 'id'>) => {
    const opts = { description, duration }

    switch (variant) {
      case 'success':
        sonnerToast.success(title ?? '', opts)
        return
      case 'warning':
        sonnerToast.warning(title ?? '', opts)
        return
      case 'destructive':
        sonnerToast.error(title ?? '', opts)
        return
      default:
        sonnerToast(title ?? '', opts)
        return
    }
  }

  const dismiss = (id?: string | number) => {
    sonnerToast.dismiss(id)
  }

  return { toasts, toast, dismiss }
}

export { useToast }