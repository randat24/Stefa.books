'use client'

import { useState } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cacheUtils } from '@/lib/cache-manager'

interface CacheClearButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export function CacheClearButton({ 
  variant = 'outline', 
  size = 'sm',
  showText = true,
  onSuccess,
  onError
}: CacheClearButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClearCache = async () => {
    setLoading(true)
    
    try {
      // Очищаем кеш изображений
      cacheUtils.clearImages()
      
      // Очищаем кеш браузера для изображений
      if (typeof window !== 'undefined') {
        // Очищаем localStorage
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('image') || key.includes('cover') || key.includes('cloudinary')) {
            localStorage.removeItem(key)
          }
        })
        
        // Очищаем sessionStorage
        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach(key => {
          if (key.includes('image') || key.includes('cover') || key.includes('cloudinary')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      onSuccess?.('Кеш изображений очищен')
      
      // Перезагружаем страницу через небольшую задержку
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Cache clear error:', error)
      onError?.('Ошибка при очистке кеша')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClearCache}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {showText && 'Очистить кеш'}
    </Button>
  )
}

export default CacheClearButton
