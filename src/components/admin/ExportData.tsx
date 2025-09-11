'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Users, BookOpen, Tag, Calendar, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface ExportDataProps {
  className?: string
}

export default function ExportData({ className }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)

  const exportOptions = [
    {
      id: 'all',
      title: 'Все данные',
      description: 'Экспорт всей базы данных',
      icon: FileText,
      color: 'bg-[var(--brand)]'
    },
    {
      id: 'books',
      title: 'Книги',
      description: 'Каталог всех книг',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      id: 'users',
      title: 'Пользователи',
      description: 'База пользователей',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'categories',
      title: 'Категории',
      description: 'Категории книг',
      icon: Tag,
      color: 'bg-orange-500'
    },
    {
      id: 'rentals',
      title: 'Аренды',
      description: 'История аренд',
      icon: Calendar,
      color: 'bg-red-500'
    },
    {
      id: 'subscription_requests',
      title: 'Заявки',
      description: 'Заявки на подписку',
      icon: Mail,
      color: 'bg-indigo-500'
    }
  ]

  const handleExport = async (type: string) => {
    try {
      setIsExporting(true)
      setExportType(type)

      // Получаем токен из localStorage
      const authToken = localStorage.getItem('supabase.auth.token')
      const token = authToken ? JSON.parse(authToken).access_token : null

      if (!token) {
        toast.error('Необходимо войти в систему')
        return
      }

      // Выполняем экспорт
      const response = await fetch(`/api/admin/export?type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка экспорта')
      }

      // Создаем blob и скачиваем файл
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Получаем имя файла из заголовка
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `export_${type}_${new Date().toISOString().split('T')[0]}.csv`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Данные ${type === 'all' ? 'экспортированы' : 'экспортированы'} успешно`)
      
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(`Ошибка экспорта: ${error.message}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handleExportAll = async () => {
    try {
      setIsExporting(true)
      setExportType('all')

      // Получаем токен из localStorage
      const authToken = localStorage.getItem('supabase.auth.token')
      const token = authToken ? JSON.parse(authToken).access_token : null

      if (!token) {
        toast.error('Необходимо войти в систему')
        return
      }

      // Экспортируем все данные
      const response = await fetch('/api/admin/export?type=all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка экспорта')
      }

      // Создаем blob и скачиваем файл
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `full_database_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Все данные экспортированы успешно')
      
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(`Ошибка экспорта: ${error.message}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Экспорт данных
          </CardTitle>
          <CardDescription>
            Экспортируйте данные из базы данных в CSV файлы для резервного копирования
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Кнопка экспорта всех данных */}
          <div className="flex justify-center">
            <Button
              onClick={handleExportAll}
              disabled={isExporting}
              size="lg"
              className="bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[#111827]"
            >
              {isExporting && exportType === 'all' ? (
                <>
                  <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-neutral-0 mr-2" />
                  Экспорт всех данных...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Экспорт всех данных
                </>
              )}
            </Button>
          </div>

          {/* Разделитель */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-caption uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Или выберите конкретный тип данных
              </span>
            </div>
          </div>

          {/* Опции экспорта */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportOptions.map((option) => {
              const Icon = option.icon
              const isCurrentlyExporting = isExporting && exportType === option.id
              
              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isCurrentlyExporting ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleExport(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${option.color} text-neutral-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-body-sm font-medium text-neutral-900">
                          {option.title}
                        </h3>
                        <p className="text-caption text-neutral-500">
                          {option.description}
                        </p>
                      </div>
                      {isCurrentlyExporting && (
                        <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Информация о экспорте */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-body-sm font-medium text-blue-900 mb-2">
              📋 Информация об экспорте
            </h4>
            <ul className="text-caption text-blue-800 space-y-1">
              <li>• Данные экспортируются в формате CSV</li>
              <li>• Кодировка: UTF-8</li>
              <li>• Разделитель: запятая</li>
              <li>• Первая строка содержит заголовки</li>
              <li>• Файлы можно импортировать в Google Sheets</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
