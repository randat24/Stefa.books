'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Check, X } from 'lucide-react'
import { logger } from '@/lib/logger'

interface Book {
  id: string
  title: string
  author: string
  article: string
  cover_url: string
  rental_days?: number
  price?: number
}

interface AddToCartButtonProps {
  book: Book
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'secondary'
}

export default function AddToCartButton({ 
  book, 
  className = '',
  size = 'md',
  variant = 'default'
}: AddToCartButtonProps) {
  const { addItem, canAddItem, state } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [showFeedback, setShowFeedback] = useState<'success' | 'error' | null>(null)

  const isInCart = state.items.some(item => item.id === book.id)
  const canAdd = canAddItem() && !isInCart

  const handleAddToCart = async () => {
    if (!canAdd) return

    setIsAdding(true)
    
    try {
      // Создаем объект для корзины с дефолтными значениями
      const cartItem = {
        id: book.id,
        title: book.title,
        author: book.author,
        article: book.article,
        cover_url: book.cover_url,
        rental_days: book.rental_days || 14, // Дефолт 14 дней
        price: book.price || 0, // Дефолт 0, если цена не указана
        pickup_method: 'store' as const
      }

      addItem(cartItem)
      
      setShowFeedback('success')
      logger.info('Book added to cart', { bookId: book.id, title: book.title })
      
      // Скрываем уведомление через 2 секунды
      setTimeout(() => setShowFeedback(null), 2000)
    } catch (error) {
      setShowFeedback('error')
      logger.error('Failed to add book to cart', { error, bookId: book.id })
      
      setTimeout(() => setShowFeedback(null), 2000)
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonText = () => {
    if (isInCart) return 'В корзині'
    if (!canAdd) return 'Ліміт досягнуто'
    return 'Додати в корзину'
  }

  const getButtonIcon = () => {
    if (showFeedback === 'success') return <Check className="h-4 w-4" />
    if (showFeedback === 'error') return <X className="h-4 w-4" />
    if (isInCart) return <Check className="h-4 w-4" />
    return <ShoppingBag className="h-4 w-4" />
  }

  const getButtonVariant = () => {
    if (isInCart) return 'secondary'
    if (showFeedback === 'success') return 'default'
    if (showFeedback === 'error') return 'destructive'
    return variant
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <div className="relative">
      <Button
        onClick={handleAddToCart}
        disabled={!canAdd || isAdding}
        variant={getButtonVariant()}
        className={`${sizeClasses[size]} ${className} ${
          isInCart ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
        }`}
      >
        {getButtonIcon()}
        <span className="ml-2">{getButtonText()}</span>
      </Button>

      {/* Feedback Badge */}
      {showFeedback && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge 
            variant={showFeedback === 'success' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {showFeedback === 'success' ? '✓' : '✗'}
          </Badge>
        </div>
      )}

      {/* Cart Limit Info */}
      {!canAdd && !isInCart && (
        <div className="mt-2 text-xs text-neutral-500 text-center">
          Максимум {state.maxItems} книг
        </div>
      )}
    </div>
  )
}
