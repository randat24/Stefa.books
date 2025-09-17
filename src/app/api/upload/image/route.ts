import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/logger';

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Файл повинен бути зображенням' }
  }

  // Проверяем размер файла
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Розмір файлу не повинен перевищувати ${MAX_FILE_SIZE / (1024 * 1024)} МБ` }
  }

  return { valid: true }
}

export async function POST(req: NextRequest) {
  try {
    // Получаем файл из FormData
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || 'stefa-books/uploads'
    const type = formData.get('type') as string || 'general'

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не знайдено' }, 
        { status: 400 }
      )
    }

    // Валидируем файл
    const validation = await validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error }, 
        { status: 400 }
      )
    }

    // Конвертируем File в Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Настройки загрузки в зависимости от типа
    const uploadConfig = getUploadConfig(type, folder)
    const publicId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Загружаем через upload_stream
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadConfig.folder,
          public_id: publicId,
          overwrite: false,
          unique_filename: true,
          use_filename: false,
          resource_type: 'image',
          transformation: uploadConfig.transformation,
          context: {
            alt: uploadConfig.alt,
            caption: `Завантажено: ${new Date().toISOString()}`
          }
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new Error('Помилка завантаження на Cloudinary'))
            return
          }
          
          if (!result?.secure_url) {
            reject(new Error('Не вдалося отримати URL завантаженого файлу'))
            return
          }

          resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    // Логируем успешную загрузку
    logger.info('Image uploaded successfully', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      size: result.bytes,
      format: result.format,
      type,
      folder: uploadConfig.folder,
      timestamp: new Date().toISOString()
    })

    // Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      message: 'Зображення успішно завантажено'
    })

  } catch (error) {
    console.error('Upload image error:', error)
    logger.error('Image upload failed', error)
    
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера при завантаженні зображення' },
      { status: 500 }
    )
  }
}

// Конфигурация загрузки в зависимости от типа с продвинутыми возможностями Cloudinary
function getUploadConfig(type: string, folder: string) {
  const configs = {
    'cover': {
      folder: 'stefa-books/covers',
      transformation: [
        { 
          fetch_format: 'auto', 
          quality: 'auto:best',
          width: 400,
          height: 600,
          crop: 'limit',
          // Продвинутые оптимизации для обложек
          flags: ['progressive', 'strip_profile'],
          color_space: 'srgb',
          dpr: 'auto',
          responsive: true
        }
      ],
      alt: 'Обкладинка книги Stefa.books'
    },
    'screenshot': {
      folder: 'stefa-books/subscription-screenshots',
      transformation: [
        { 
          fetch_format: 'auto', 
          quality: 'auto:best',
          width: 800,
          height: 1200,
          crop: 'limit',
          // Оптимизации для скриншотов
          flags: ['progressive', 'strip_profile'],
          color_space: 'srgb',
          dpr: 'auto'
        }
      ],
      alt: 'Скриншот переказу Stefa.books'
    },
    'avatar': {
      folder: 'stefa-books/avatars',
      transformation: [
        { 
          fetch_format: 'auto', 
          quality: 'auto:best',
          width: 200,
          height: 200,
          crop: 'fill',
          gravity: 'face',
          // Оптимизации для аватаров
          flags: ['progressive', 'strip_profile'],
          color_space: 'srgb',
          radius: 'max',
          border: '1px_solid_rgb:ffffff'
        }
      ],
      alt: 'Аватар користувача Stefa.books'
    },
    'hero': {
      folder: 'stefa-books/hero-images',
      transformation: [
        { 
          fetch_format: 'auto', 
          quality: 'auto:best',
          width: 1920,
          height: 1080,
          crop: 'limit',
          // Оптимизации для hero изображений
          flags: ['progressive', 'strip_profile'],
          color_space: 'srgb',
          dpr: 'auto',
          responsive: true,
          gravity: 'auto'
        }
      ],
      alt: 'Hero зображення Stefa.books'
    },
    'thumbnail': {
      folder: 'stefa-books/thumbnails',
      transformation: [
        { 
          fetch_format: 'auto', 
          quality: 'auto:good',
          width: 150,
          height: 150,
          crop: 'fill',
          gravity: 'center',
          // Оптимизации для миниатюр
          flags: ['progressive', 'strip_profile'],
          color_space: 'srgb',
          radius: 8
        }
      ],
      alt: 'Мініатюра Stefa.books'
    },
    'document': {
      folder: 'stefa-books/documents',
      transformation: [
        { 
          fetch_format: 'auto', 
          quality: 'auto:best',
          width: 1200,
          height: 1600,
          crop: 'limit',
          // Оптимизации для документов
          flags: ['progressive', 'strip_profile'],
          color_space: 'srgb',
          dpr: 'auto'
        }
      ],
      alt: 'Документ Stefa.books'
    },
    'general': {
      folder: folder || 'stefa-books/uploads',
      transformation: [
        { 
          fetch_format: 'auto', 
          quality: 'auto:best',
          width: 1000,
          height: 1000,
          crop: 'limit',
          // Базовые оптимизации
          flags: ['progressive', 'strip_profile'],
          color_space: 'srgb',
          dpr: 'auto'
        }
      ],
      alt: 'Зображення Stefa.books'
    }
  }

  return configs[type as keyof typeof configs] || configs.general
}
