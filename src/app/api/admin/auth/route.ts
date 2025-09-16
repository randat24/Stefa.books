import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stefa-books.com.ua'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'oqP_Ia5VMO2wy46p'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Проверяем учетные данные
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      logger.warn('Admin auth: Invalid credentials', { email })
      return NextResponse.json(
        { error: 'Неверные учетные данные' },
        { status: 401 }
      )
    }

    // Создаем простой токен (в реальном приложении использовали бы JWT)
    const token = ADMIN_PASSWORD

    logger.info('Admin auth: Successful login', { email })

    return NextResponse.json({
      success: true,
      token,
      user: {
        email,
        role: 'admin'
      }
    })

  } catch (error) {
    logger.error('Admin auth: Error', error)
    return NextResponse.json(
      { error: 'Ошибка авторизации' },
      { status: 500 }
    )
  }
}