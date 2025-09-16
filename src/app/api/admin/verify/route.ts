import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { logger } from '@/lib/logger'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const secret = new TextEncoder().encode(JWT_SECRET)

    try {
      const { payload } = await jwtVerify(token, secret)
      
      if (payload.role !== 'admin') {
        return NextResponse.json(
          { error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          email: payload.email,
          role: payload.role
        }
      })

    } catch (jwtError) {
      logger.warn('Admin verify: Invalid token', jwtError)
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      )
    }

  } catch (error) {
    logger.error('Admin verify: Error', error)
    return NextResponse.json(
      { error: 'Ошибка проверки токена' },
      { status: 500 }
    )
  }
}
