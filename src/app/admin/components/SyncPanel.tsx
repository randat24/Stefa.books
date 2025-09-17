"use client"

import { useState, useEffect } from "react"
import { Cloud, Download, Upload, RefreshCw, CheckCircle, Info, ExternalLink, Users, BookOpen, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SyncStatus {
  supabase_count: number
  sheets_count: number
  last_check: string
  sheets_available: boolean
  sync_needed: boolean
}

interface BooksSyncStatus {
  totalBooks: number
  availableBooks: number
  totalCategories: number
  lastCheck: string
  syncStatus: string
}

interface SyncResponse {
  success: boolean
  message?: string
  count?: number
  error?: string
}

export function SyncPanel() {
  const [status, setStatus] = useState<SyncStatus | null>(null) 
  const [booksStatus, setBooksStatus] = useState<BooksSyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [creatingTestData, setCreatingTestData] = useState(false)
  const [clearingTestData, setClearingTestData] = useState(false)
  const [syncingBooks, setSyncingBooks] = useState(false)

  // ============================================================================
  // ЗАГРУЗКА СТАТУСА
  // ============================================================================

  async function loadSyncStatus() {
    try {
      setLoading(true)
      const [syncResponse, booksResponse] = await Promise.all([
        fetch('/api/sync'),
        fetch('/api/admin/sync-books')
      ])
      
      const syncData = await syncResponse.json()
      const booksData = await booksResponse.json()
      
      if (syncData.success) {
        setStatus(syncData.data)
      } else {
        console.error('Failed to load sync status:', syncData.error)
      }
      
      if (booksData.success) {
        setBooksStatus(booksData.data)
      } else {
        console.error('Failed to load books status:', booksData.error)
      }
    } catch (error) {
      console.error('Error loading sync status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSyncStatus()
  }, [])

  // ============================================================================
  // ОПЕРАЦИИ СИНХРОНИЗАЦИИ
  // ============================================================================

  async function handleSync(action: 'backup_to_sheets' | 'import_from_sheets') {
    if (syncing) return

    try {
      setSyncing(true)
      setLastAction(null)

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      const data: SyncResponse = await response.json()

      if (data.success) {
        setLastAction(`✅ ${data.message}`)
        // Обновляем статус после успешной операции
        await loadSyncStatus()
      } else {
        setLastAction(`❌ Ошибка: ${data.error}`)
      }
    } catch (error) {
      setLastAction(`❌ Ошибка сети: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleBackup = () => handleSync('backup_to_sheets')
  const handleImport = () => handleSync('import_from_sheets')

  // ============================================================================
  // СИНХРОНИЗАЦИЯ КНИГ С САЙТОМ
  // ============================================================================

  async function handleSyncBooksToSite() {
    if (syncingBooks) return

    try {
      setSyncingBooks(true)
      setLastAction(null)

      const response = await fetch('/api/admin/sync-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setLastAction(`✅ ${data.message}`)
        // Обновляем статус после успешной синхронизации
        await loadSyncStatus()
      } else {
        setLastAction(`❌ Помилка: ${data.error}`)
      }
    } catch (error) {
      setLastAction(`❌ Помилка мережі: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
    } finally {
      setSyncingBooks(false)
    }
  }

  // ============================================================================
  // СОЗДАНИЕ ТЕСТОВЫХ ДАННЫХ
  // ============================================================================

  async function handleCreateTestData() {
    if (creatingTestData) return

    try {
      setCreatingTestData(true)
      setLastAction(null)

      const response = await fetch('/api/admin/test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setLastAction(`✅ Создано: ${data.data.users} пользователей, ${data.data.rentals} аренд, ${data.data.payments} платежей`)
        // Обновляем статус после создания данных
        await loadSyncStatus()
      } else {
        setLastAction(`❌ Ошибка: ${data.error}`)
      }
    } catch (error) {
      setLastAction(`❌ Ошибка сети: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setCreatingTestData(false)
    }
  }

  async function handleClearTestData() {
    if (clearingTestData) return

    try {
      setClearingTestData(true)
      setLastAction(null)

      const response = await fetch('/api/admin/clear-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setLastAction('✅ Тестові дані очищено')
        // Обновляем статус после очистки данных
        await loadSyncStatus()
      } else {
        setLastAction(`❌ Ошибка: ${data.error}`)
      }
    } catch (error) {
      setLastAction(`❌ Ошибка сети: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setClearingTestData(false)
    }
  }

  // ============================================================================
  // РЕНДЕР КОМПОНЕНТА
  // ============================================================================

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Sheets Синхронизация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Загрузка статуса...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Google Sheets Синхронизация
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* СТАТУС СИНХРОНИЗАЦИИ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-h2 text-brand-accent-light">{booksStatus?.totalBooks || 0}</div>
            <div className="text-body-sm text-muted-foreground">Всього книг в БД</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-h2 text-green-600">{booksStatus?.availableBooks || 0}</div>
            <div className="text-body-sm text-muted-foreground">Доступних книг</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-h2 text-purple-600">{booksStatus?.totalCategories || 0}</div>
            <div className="text-body-sm text-muted-foreground">Категорій</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Готово
              </Badge>
            </div>
            <div className="text-body-sm text-muted-foreground mt-1">Статус синхронізації</div>
          </div>
        </div>

        {/* ИНДИКАТОР НЕОБХОДИМОСТИ СИНХРОНИЗАЦИИ */}
        {status?.sync_needed && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Количество книг в Supabase ({status.supabase_count}) не совпадает с Google Sheets ({status.sheets_count}). 
              Рекомендуется синхронизация.
            </AlertDescription>
          </Alert>
        )}

        {/* ПОСЛЕДНЕЕ ДЕЙСТВИЕ */}
        {lastAction && (
          <Alert className={lastAction.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription>{lastAction}</AlertDescription>
          </Alert>
        )}

        {/* СИНХРОНИЗАЦИЯ КНИГ С САЙТОМ */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-brand-accent-light" />
            <h3 className="font-semibold text-blue-900">Синхронізація з сайтом</h3>
          </div>
          <p className="text-body-sm text-blue-700 mb-4">
            Вивантажити всі {booksStatus?.totalBooks || 0} книг з бази даних на сайт для відображення в каталозі
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleSyncBooksToSite}
              disabled={syncingBooks || !booksStatus?.totalBooks}
              className="flex-1"
              variant="primary"
            >
              {syncingBooks ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4 mr-2" />
              )}
              {syncingBooks ? 'Синхронізація...' : 'Вивантажити книги на сайт'}
            </Button>
            <Button
              onClick={loadSyncStatus}
              disabled={syncingBooks}
              variant="outline"
              size="md"
            >
              <RefreshCw className={`h-4 w-4 ${syncingBooks ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* КНОПКИ ДЕЙСТВИЙ */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleBackup}
              disabled={syncing || !status?.sheets_available}
              className="flex-1"
              variant="primary"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Резервная копия в Sheets
            </Button>

            <Button
              onClick={handleImport}
              disabled={syncing || !status?.sheets_available}
              className="flex-1"
              variant="outline"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Импорт из Sheets
            </Button>

            <Button
              onClick={loadSyncStatus}
              disabled={syncing}
              variant="ghost"
              size="md"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* КНОПКА СОЗДАНИЯ ТЕСТОВЫХ ДАННЫХ */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Тестовые данные</h4>
              <Badge variant="outline" className="text-xs">
                Для разработки
              </Badge>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleCreateTestData}
                disabled={creatingTestData || syncing}
                className="w-full"
                variant="outline"
              >
                {creatingTestData ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                Создать 3 пользователей + 3 аренды + платежи
              </Button>
              <Button
                onClick={handleClearTestData}
                disabled={clearingTestData || syncing}
                className="w-full"
                variant="ghost"
                size="md"
              >
                {clearingTestData ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                Очистить тестовые данные
              </Button>
            </div>
            <p className="text-caption text-muted-foreground mt-1">
              Создает тестовых пользователей с разными подписками, аренды и платежи для проверки админ панели
            </p>
          </div>
        </div>

        {/* ИНФОРМАЦИЯ */}
        <div className="text-body-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Последняя проверка: {status?.last_check ? new Date(status.last_check).toLocaleString('uk-UA') : 'Никогда'}</span>
          </div>
          
          {!status?.sheets_available && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <span>
                Проверьте настройки в{' '}
                <a 
                  href="/GOOGLE_SHEETS_SETUP.md" 
                  target="_blank" 
                  className="text-brand-accent-light hover:text-brand-accent-light/80"
                >
                  документации
                </a>
              </span>
            </div>
          )}
        </div>

        {/* ОПИСАНИЕ ДЕЙСТВИЙ */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Доступные действия:</h4>
          <ul className="text-body-sm text-muted-foreground space-y-1">
            <li className="flex items-start gap-2">
              <BookOpen className="h-3 w-3 mt-0.5 text-brand-accent" />
              <span><strong>Синхронизация с сайтом:</strong> Выгружает все книги из базы данных на сайт для отображения в каталоге</span>
            </li>
            <li className="flex items-start gap-2">
              <Upload className="h-3 w-3 mt-0.5 text-green-500" />
              <span><strong>Резервная копия:</strong> Сохраняет все книги из Supabase в Google Sheets (заменяет существующие данные)</span>
            </li>
            <li className="flex items-start gap-2">
              <Download className="h-3 w-3 mt-0.5 text-purple-500" />
              <span><strong>Импорт:</strong> Загружает книги из Google Sheets в Supabase (заменяет существующие данные)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}