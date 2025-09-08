"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// ============================================================================
// КОМПОНЕНТ ЗАВАНТАЖЕННЯ ОБКЛАДИНКИ
// ============================================================================

interface CoverUploadProps {
  currentCoverUrl?: string
  onCoverUploaded: (coverUrl: string) => void
  onCoverRemoved: () => void
  disabled?: boolean
}

export function CoverUpload({ 
  currentCoverUrl, 
  onCoverUploaded, 
  onCoverRemoved, 
  disabled = false 
}: CoverUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============================================================================
  // ОБРОБКА ЗАВАНТАЖЕННЯ ФАЙЛУ
  // ============================================================================

  async function handleFileUpload(file: File) {
    if (disabled) return

    try {
      setUploading(true)
      
      // Створюємо превью
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      
      // Створюємо FormData
      const formData = new FormData()
      formData.append('file', file)

      // Завантажуємо на Cloudinary
      const response = await fetch('/api/admin/upload/cover', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Помилка завантаження')
      }

      // Очищаємо превью і викликаємо callback
      URL.revokeObjectURL(previewUrl)
      setPreview(null)
      onCoverUploaded(result.secure_url)

    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Помилка завантаження обкладинки')
      
      // Очищаємо превью при помилці
      if (preview) {
        URL.revokeObjectURL(preview)
        setPreview(null)
      }
    } finally {
      setUploading(false)
    }
  }

  // ============================================================================
  // ОБРОБКА ПОДІЙ
  // ============================================================================

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
  }

  function handleRemoveCover() {
    setPreview(null)
    onCoverRemoved()
    
    // Очищаємо input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleClickUpload() {
    fileInputRef.current?.click()
  }

  // ============================================================================
  // РЕНДЕР
  // ============================================================================

  const showImage = currentCoverUrl || preview
  const imageUrl = preview || currentCoverUrl

  return (
    <div className="space-y-3">
      <Label>Обкладинка</Label>
      
      {/* Поле завантаження */}
      <div className="space-y-3">
        {/* Прихований input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        {/* Зона завантаження */}
        {!showImage ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClickUpload}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${dragActive ? 'border-brand-accent bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              ${uploading ? 'pointer-events-none' : ''}
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 text-brand-accent animate-spin" />
                <div>
                  <p className="text-body-sm font-medium text-gray-900">Завантаження...</p>
                  <p className="text-caption text-gray-500">Обробляємо вашу обкладинку</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-2xl">
                  <Upload className="size-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-900">
                    Натисніть або перетягніть файл
                  </p>
                  <p className="text-caption text-gray-500">
                    JPEG, PNG, WebP, GIF (макс. 5 МБ)
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Превью обкладинки
          <div className="relative">
            <div className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={imageUrl!}
                alt="Превью обкладинки"
                width={200}
                height={300}
                className="mx-auto object-cover"
                style={{ width: 'auto', height: '300px', maxWidth: '200px' }}
              />
              
              {/* Накладення при наведенні */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="md"
                  variant="outline"
                  onClick={handleClickUpload}
                  disabled={disabled || uploading}
                  className="text-white bg-white/20 hover:bg-white/30 border-white/20"
                >
                  <Upload className="size-4 mr-1" />
                  Змінити
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  onClick={handleRemoveCover}
                  disabled={disabled || uploading}
                  className="text-white bg-red-500/20 hover:bg-red-500/30 border-red-500/20"
                >
                  <X className="size-4 mr-1" />
                  Видалити
                </Button>
              </div>
            </div>

            {/* Інформація про файл */}
            <div className="mt-2 text-center">
              {uploading ? (
                <p className="text-caption text-gray-500">Завантаження...</p>
              ) : (
                <p className="text-caption text-gray-500">
                  {preview ? 'Новий файл завантажено' : 'Поточна обкладинка'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Підказки */}
        <div className="text-caption text-gray-500 space-y-1">
          <p>• Рекомендовані розміри: мінімум 200×300px</p>
          <p>• Підтримувані формати: JPEG, PNG, WebP, GIF</p>
          <p>• Максимальний розмір: 5 МБ</p>
        </div>
      </div>
    </div>
  )
}