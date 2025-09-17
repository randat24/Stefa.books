import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// ============================================================================
// КОНФІГУРАЦІЯ CLOUDINARY
// ============================================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true })

// ============================================================================
// ОБМЕЖЕННЯ ФАЙЛІВ
// ============================================================================

// Константы перенесены в универсальный API /api/upload/image

// ============================================================================
// ВАЛІДАЦІЯ ФАЙЛУ
// ============================================================================

// Валидация теперь происходит в универсальном API /api/upload/image

// ============================================================================
// ЗАВАНТАЖЕННЯ НА CLOUDINARY
// ============================================================================

export async function POST(req: Request) {
  try {
    // Получаем FormData из оригинального запроса
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не знайдено' }, 
        { status: 400 }
      )
    }

    // Создаем новый FormData для универсального API
    const newFormData = new FormData()
    newFormData.append('file', file)
    newFormData.append('type', 'cover')

    // Получаем базовый URL для внутреннего запроса
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Делаем запрос к универсальному API
    const response = await fetch(`${baseUrl}/api/upload/image`, {
      method: 'POST',
      body: newFormData
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status })
    }

    // Возвращаем результат с правильным сообщением
    return NextResponse.json({
      ...result,
      message: 'Обкладинка успішно завантажена'
    })

  } catch (error) {
    console.error('Upload cover error:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера при завантаженні обкладинки' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ВИДАЛЕННЯ ФАЙЛУ
// ============================================================================

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const publicId = searchParams.get('public_id')

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID не вказано' }, 
        { status: 400 }
      )
    }

    // Видаляємо файл з Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Файл успішно видалено'
      })
    } else {
      return NextResponse.json(
        { error: 'Не вдалося видалити файл' }, 
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Delete cover error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Невідома помилка видалення' 
      }, 
      { status: 500 }
    )
  }
}