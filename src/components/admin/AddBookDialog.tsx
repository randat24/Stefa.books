'use client'

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookAdded?: () => void
  onBookCreated?: () => void
}

export function AddBookDialog({ open, onOpenChange, onBookAdded, onBookCreated }: AddBookDialogProps) {
  return null // Placeholder component
}