import { NextRequest, NextResponse } from 'next/server';

// Проксируем запрос к универсальному API загрузки изображений
export async function POST(req: NextRequest) {
  try {
    // Получаем FormData из оригинального запроса
    const formData = await req.formData()
    const file = formData.get('screenshot') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Файл скриншота не знайдено' }, 
        { status: 400 }
      )
    }

    // Создаем новый FormData для универсального API
    const newFormData = new FormData()
    newFormData.append('file', file)
    newFormData.append('type', 'screenshot')

    // Делаем запрос к универсальному API
    const response = await fetch(`${req.nextUrl.origin}/api/upload/image`, {
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
      message: 'Скриншот успішно завантажено'
    })

  } catch (error) {
    console.error('Upload screenshot error:', error)
    
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера при завантаженні скриншота' },
      { status: 500 }
    )
  }
}
