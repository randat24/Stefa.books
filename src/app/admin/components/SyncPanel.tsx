"use client"

import { useState, useEffect } from "react"
import { Cloud, Download, Upload, RefreshCw, CheckCircle, AlertCircle, Info, ExternalLink, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SyncStatus {
  supabase_count: number
  sheets_count: number
  last_check: string
  sheets_available: boolean
  sync_needed: boolean
}

interface SyncResponse {
  success: boolean
  message?: string
  count?: number
  error?: string
}

export function SyncPanel() {
  const [status, setStatus] = useState<SyncStatus | null>(null) 
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [creatingTestData, setCreatingTestData] = useState(false)
  const [clearingTestData, setClearingTestData] = useState(false)

  // ============================================================================
  // ЗАГРУЗКА СТАТУСА
  // ============================================================================

  async function loadSyncStatus() {
    try {
      setLoading(true)
      const response = await fetch('/api/sync')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      } else {
        console.error('Failed to load sync status:', data.error)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{status?.supabase_count || 0}</div>
            <div className="text-sm text-muted-foreground">Книг в Supabase</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{status?.sheets_count || 0}</div>
            <div className="text-sm text-muted-foreground">Книг в Google Sheets</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-2">
              {status?.sheets_available ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Подключено
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Не доступно
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Статус подключения</div>
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
            <p className="text-xs text-muted-foreground mt-1">
              Создает тестовых пользователей с разными подписками, аренды и платежи для проверки админ панели
            </p>
          </div>
        </div>

        {/* ИНФОРМАЦИЯ */}
        <div className="text-sm text-muted-foreground space-y-2">
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
                  className="text-blue-600 hover:underline"
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
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-start gap-2">
              <Upload className="h-3 w-3 mt-0.5 text-blue-500" />
              <span><strong>Резервная копия:</strong> Сохраняет все книги из Supabase в Google Sheets (заменяет существующие данные)</span>
            </li>
            <li className="flex items-start gap-2">
              <Download className="h-3 w-3 mt-0.5 text-green-500" />
              <span><strong>Импорт:</strong> Загружает книги из Google Sheets в Supabase (заменяет существующие данные)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}