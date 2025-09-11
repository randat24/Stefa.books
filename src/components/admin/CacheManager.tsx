'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Trash2, Image, Database, BarChart3, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CacheStats {
  images: {
    totalEntries: number
    expiredEntries: number
    totalSize: string
    maxSize: number
  }
  api: {
    totalEntries: number
    expiredEntries: number
    totalSize: string
    maxSize: number
  }
  books: {
    totalEntries: number
    expiredEntries: number
    totalSize: string
    maxSize: number
  }
}

export function CacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Загружаем статистику кеша
  const loadStats = async () => {
    try {
      const response = await fetch('/api/cache/clear')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error)
    }
  }

  // Очистка кеша
  const clearCache = async (type: 'all' | 'images' | 'api') => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setStats(data.stats)
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка при очистке кеша' })
      }
    } catch (error) {
      console.error('Cache clear error:', error)
      setMessage({ type: 'error', text: 'Ошибка при очистке кеша' })
    } finally {
      setLoading(false)
    }
  }


  // Загружаем статистику при монтировании
  useEffect(() => {
    loadStats()
  }, [])

  // Автоматически скрываем сообщения через 5 секунд
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление кешем</h2>
          <p className="text-neutral-600">Очистка и мониторинг кеша изображений и API</p>
        </div>
        <Button
          onClick={loadStats}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить статистику
        </Button>
      </div>

      {/* Сообщения */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Статистика кеша */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="w-5 h-5" />
                Изображения
              </CardTitle>
              <CardDescription>Кеш обложек книг</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Записей:</span>
                  <Badge variant="outline">{stats.images.totalEntries}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Устаревших:</span>
                  <Badge variant={stats.images.expiredEntries > 0 ? "destructive" : "outline"}>
                    {stats.images.expiredEntries}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Размер:</span>
                  <span className="text-sm font-medium">{stats.images.totalSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Лимит:</span>
                  <span className="text-sm font-medium">{stats.images.maxSize}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Database className="w-5 h-5" />
                API
              </CardTitle>
              <CardDescription>Кеш API запросов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Записей:</span>
                  <Badge variant="outline">{stats.api.totalEntries}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Устаревших:</span>
                  <Badge variant={stats.api.expiredEntries > 0 ? "destructive" : "outline"}>
                    {stats.api.expiredEntries}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Размер:</span>
                  <span className="text-sm font-medium">{stats.api.totalSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Лимит:</span>
                  <span className="text-sm font-medium">{stats.api.maxSize}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <BarChart3 className="w-5 h-5" />
                Книги
              </CardTitle>
              <CardDescription>Кеш данных книг</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Записей:</span>
                  <Badge variant="outline">{stats.books.totalEntries}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Устаревших:</span>
                  <Badge variant={stats.books.expiredEntries > 0 ? "destructive" : "outline"}>
                    {stats.books.expiredEntries}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Размер:</span>
                  <span className="text-sm font-medium">{stats.books.totalSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Лимит:</span>
                  <span className="text-sm font-medium">{stats.books.maxSize}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Кнопки управления */}
      <Card>
        <CardHeader>
          <CardTitle>Действия с кешем</CardTitle>
          <CardDescription>Очистка различных типов кеша</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => clearCache('images')}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                /* eslint-disable-next-line jsx-a11y/alt-text */
                <Image className="w-4 h-4" />
              )}
              Очистить изображения
            </Button>

            <Button
              onClick={() => clearCache('api')}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                /* eslint-disable-next-line jsx-a11y/alt-text */
                <Database className="w-4 h-4" />
              )}
              Очистить API
            </Button>

            <Button
              onClick={() => clearCache('all')}
              disabled={loading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                /* eslint-disable-next-line jsx-a11y/alt-text */
                <Trash2 className="w-4 h-4" />
              )}
              Очистить весь кеш
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Инструкции */}
      <Card>
        <CardHeader>
          <CardTitle>Рекомендации</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-neutral-600">
          <p>• <strong>Очистка изображений</strong> - используйте когда обложки не обновляются</p>
          <p>• <strong>Очистка API</strong> - используйте когда данные книг не обновляются</p>
          <p>• <strong>Очистка всего кеша</strong> - используйте при серьезных проблемах</p>
          <p>• Кеш автоматически очищается от устаревших записей</p>
          <p>• Изображения кешируются на 10 минут, API на 5 минут</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CacheManager
