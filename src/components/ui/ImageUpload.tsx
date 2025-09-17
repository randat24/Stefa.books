"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { logger } from '@/lib/logger';

interface ImageUploadProps {
  /** URL текущего изображения */
  currentImageUrl?: string;
  /** Callback при успешной загрузке */
  onImageUploaded: (url: string) => void;
  /** Callback при удалении изображения */
  onImageRemoved?: () => void;
  /** Отключить загрузку */
  disabled?: boolean;
  /** API endpoint для загрузки */
  uploadEndpoint: string;
  /** Название поля в FormData */
  fieldName?: string;
  /** Максимальный размер файла в байтах */
  maxFileSize?: number;
  /** Разрешенные типы файлов */
  acceptedTypes?: string;
  /** Плейсхолдер */
  placeholder?: string;
  /** Размер превью */
  previewSize?: 'sm' | 'md' | 'lg';
  /** Класс для контейнера */
  className?: string;
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  disabled = false,
  uploadEndpoint,
  fieldName = 'file',
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = 'image/*',
  placeholder = 'Натисніть для завантаження зображення',
  previewSize = 'md',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null | null>(null);

  // Размеры превью
  const previewSizes = {
    sm: { width: 80, height: 80, className: 'w-20 h-20' },
    md: { width: 120, height: 120, className: 'w-30 h-30' },
    lg: { width: 200, height: 200, className: 'w-50 h-50' }
  };

  const currentSize = previewSizes[previewSize];

  const handleFileUpload = useCallback(async (file: File) => {
    if (disabled) return;

    // Валидация файла
    if (!file.type.startsWith('image/')) {
      alert('Будь ласка, оберіть зображення');
      return;
    }

    if (file.size > maxFileSize) {
      alert(`Розмір файлу не повинен перевищувати ${Math.round(maxFileSize / (1024 * 1024))}MB`);
      return;
    }

    try {
      setUploading(true);
      
      // Создаем превью
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Создаем FormData
      const formData = new FormData();
      formData.append(fieldName, file);

      // Загружаем на сервер
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка завантаження');
      }

      // Очищаем превью и вызываем callback
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
      
      // Вызываем callback с URL загруженного изображения
      onImageUploaded(result.secure_url);

      logger.info('Image uploaded successfully', {
        url: result.secure_url,
        public_id: result.public_id,
        endpoint: uploadEndpoint
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Очищаем превью при ошибке
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      
      alert(`Помилка завантаження: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setUploading(false);
    }
  }, [disabled, maxFileSize, fieldName, uploadEndpoint, onImageUploaded, preview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageRemoved?.();
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const showImage = currentImageUrl || preview;
  const imageUrl = preview || currentImageUrl;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Скрытый input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Зона загрузки */}
      {!showImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClickUpload}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:border-neutral-400'}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-neutral-900">Завантаження...</p>
                <p className="text-xs text-neutral-500">Будь ласка, зачекайте</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="text-neutral-400">
                <Upload className="size-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  {placeholder}
                </p>
                <p className="text-xs text-neutral-500">
                  Перетягніть файл або натисніть для вибору
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  JPG, PNG, GIF (до {Math.round(maxFileSize / (1024 * 1024))}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Превью изображения */}
          <div className="relative inline-block">
            <div className={`${currentSize.className} relative rounded-lg overflow-hidden border border-neutral-200`}>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Превью"
                  width={currentSize.width}
                  height={currentSize.height}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay с кнопками */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleClickUpload}
                    disabled={disabled || uploading}
                    className="bg-white text-neutral-900 hover:bg-neutral-100"
                  >
                    <ImageIcon className="size-4" />
                  </Button>
                  
                  {onImageRemoved && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                      disabled={disabled || uploading}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Информация о файле */}
          {preview && (
            <div className="text-center">
              <p className="text-xs text-neutral-500">
                Превью завантажуваного зображення
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
