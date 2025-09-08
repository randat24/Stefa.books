import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// ============================================================================
// КОНФІГУРАЦІЯ CLOUDINARY
// ============================================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

// ============================================================================
// ОБМЕЖЕННЯ ФАЙЛІВ
// ============================================================================

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp', 
  'image/gif'
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 МБ

// ============================================================================
// ВАЛІДАЦІЯ ФАЙЛУ
// ============================================================================

async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Перевіряємо MIME тип
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { 
      valid: false, 
      error: `Непідтримуваний тип файлу. Дозволені: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}` 
    }
  }

  // Перевіряємо розмір
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `Файл занадто великий. Максимум: ${MAX_FILE_SIZE / (1024 * 1024)} МБ` 
    }
  }

  return { valid: true }
}

// ============================================================================
// ЗАВАНТАЖЕННЯ НА CLOUDINARY
// ============================================================================

export async function POST(req: Request): Promise<Response> {
  try {
    // Отримуємо файл з FormData
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не знайдено' }, 
        { status: 400 }
      )
    }

    // Валідуємо файл
    const validation = await validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error }, 
        { status: 400 }
      )
    }

    // Конвертуємо File в Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Налаштування завантаження
    const folder = 'stefa-books/covers'
    const publicId = `stefa-books-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Завантажуємо через upload_stream
    interface CloudinaryUploadResult {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      bytes: number;
      format: string;
    }

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: false,
          unique_filename: true,
          use_filename: false,
          resource_type: 'image',
          // Базові трансформації для оптимізації
          transformation: [
            { 
              fetch_format: 'auto', 
              quality: 'auto:best',
              width: 400, // максимальна ширина
              height: 600, // максимальна висота
              crop: 'limit' // не обрізаємо, тільки масштабуємо
            }
          ],
          // Метадані для пошуку
          context: {
            alt: `Обкладинка книги Stefa.books`,
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

    // Повертаємо успішний результат
    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      message: 'Обкладинка успішно завантажена'
    })

  } catch (error) {
    console.error('Upload cover error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Невідома помилка завантаження' 
      }, 
      { status: 500 }
    )
  }
}

// ============================================================================
// ВИДАЛЕННЯ ФАЙЛУ
// ============================================================================

export async function DELETE(req: Request): Promise<Response> {
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