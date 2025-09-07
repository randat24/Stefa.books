'use client'

import { memo, useCallback, useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface OptimizedImageUploadProps {
  onUpload: (file: File) => void
  onRemove?: () => void
  currentImage?: string
  className?: string
  accept?: string
  maxSize?: number // в байтах
  maxWidth?: number
  maxHeight?: number
  quality?: number
  disabled?: boolean
  loading?: boolean
  error?: string
}

const OptimizedImageUpload = memo(function OptimizedImageUpload({
  onUpload,
  onRemove,
  currentImage,
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8,
  disabled = false,
  loading = false,
  error,
}: OptimizedImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploadError, setUploadError] = useState<string | null>(error || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Обработка загрузки файла
  const handleFile = useCallback(async (file: File) => {
    setUploadError(null)

    // Проверка размера файла
    if (file.size > maxSize) {
      setUploadError(`Файл занадто великий. Максимальний розмір: ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setUploadError('Будь ласка, виберіть зображення')
      return
    }

    try {
      // Создаем превью
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Оптимизируем изображение
      const optimizedFile = await optimizeImage(file, maxWidth, maxHeight, quality)
      
      // Загружаем файл
      onUpload(optimizedFile)
    } catch (err) {
      setUploadError('Помилка обробки зображення')
      console.error('Image optimization error:', err)
    }
  }, [maxSize, maxWidth, maxHeight, quality, onUpload])

  // Оптимизация изображения
  const optimizeImage = useCallback(async (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Вычисляем новые размеры
        let { width, height } = img
        const aspectRatio = width / height

        if (width > maxWidth) {
          width = maxWidth
          height = width / aspectRatio
        }

        if (height > maxHeight) {
          height = maxHeight
          width = height * aspectRatio
        }

        // Устанавливаем размеры canvas
        canvas.width = width
        canvas.height = height

        // Рисуем изображение
        ctx?.drawImage(img, 0, 0, width, height)

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(optimizedFile)
            } else {
              reject(new Error('Failed to optimize image'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Обработка drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || loading) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [disabled, loading, handleFile])

  // Обработка выбора файла
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [handleFile])

  // Обработка клика по области загрузки
  const handleClick = useCallback(() => {
    if (!disabled && !loading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled, loading])

  // Обработка удаления изображения
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    setUploadError(null)
    onRemove?.()
  }, [onRemove])

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || loading}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Превью зображення"
              className="max-w-full max-h-64 mx-auto rounded-lg"
            />
            {!disabled && !loading && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Видалити зображення"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {loading ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {loading ? 'Завантаження...' : 'Перетягніть зображення сюди'}
              </p>
              <p className="text-sm text-gray-500">
                або <span className="text-blue-600 hover:text-blue-500 cursor-pointer">виберіть файл</span>
              </p>
            </div>

            <div className="text-xs text-gray-400">
              PNG, JPG, GIF до {Math.round(maxSize / 1024 / 1024)}MB
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default OptimizedImageUpload
