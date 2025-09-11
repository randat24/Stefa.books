import { NextRequest, NextResponse } from 'next/server'
import { cacheUtils } from '@/lib/cache-manager'

/**
 * API endpoint для очистки кеша
 * POST /api/cache/clear
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, imageUrl } = body

    // Проверяем авторизацию (опционально)
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader || !isValidToken(authHeader)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    switch (type) {
      case 'all':
        cacheUtils.clearAll()
        return NextResponse.json({ 
          success: true, 
          message: 'Весь кеш очищен',
          stats: cacheUtils.getStats()
        })

      case 'images':
        cacheUtils.clearImages()
        return NextResponse.json({ 
          success: true, 
          message: 'Кеш изображений очищен',
          stats: cacheUtils.getStats()
        })

      case 'api':
        cacheUtils.clearApi()
        return NextResponse.json({ 
          success: true, 
          message: 'Кеш API очищен',
          stats: cacheUtils.getStats()
        })

      case 'image':
        if (!imageUrl) {
          return NextResponse.json({ 
            error: 'URL изображения не указан' 
          }, { status: 400 })
        }
        
        cacheUtils.refreshImage(imageUrl)
        return NextResponse.json({ 
          success: true, 
          message: `Изображение ${imageUrl} обновлено`,
          stats: cacheUtils.getStats()
        })

      default:
        return NextResponse.json({ 
          error: 'Неверный тип кеша. Доступные: all, images, api, image' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json({ 
      error: 'Ошибка при очистке кеша' 
    }, { status: 500 })
  }
}

/**
 * GET /api/cache/clear - получить статистику кеша
 */
export async function GET() {
  try {
    const stats = cacheUtils.getStats()
    
    return NextResponse.json({
      success: true,
      stats,
      message: 'Статистика кеша получена'
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json({ 
      error: 'Ошибка при получении статистики кеша' 
    }, { status: 500 })
  }
}
