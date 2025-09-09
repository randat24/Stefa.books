"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Clock, User, BookOpen, Phone, Mail, RefreshCw, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: 'subscription_expiring' | 'subscription_overdue' | 'rental_overdue'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  user?: {
    id: string
    name: string
    email: string
    phone: string
    subscription_type: string
    subscription_end: string
  }
  rental?: {
    id: string
    user_name: string
    user_email: string
    user_phone: string
    book_title: string
    book_code: string
    due_date: string
  }
  daysLeft?: number
  daysOverdue?: number
  createdAt: string
}

interface NotificationsData {
  notifications: Notification[]
  summary: {
    total: number
    expiring_subscriptions: number
    overdue_subscriptions: number
    overdue_rentals: number
    high_priority: number
    medium_priority: number
  }
}

interface NotificationsPanelProps {
  onRefresh?: () => void
}

export function NotificationsPanel({ }: NotificationsPanelProps) {
  const [data, setData] = useState<NotificationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/notifications')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError('Помилка завантаження сповіщень')
      }
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Помилка завантаження сповіщень')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Високий'
      case 'medium': return 'Середній'
      case 'low': return 'Низький'
      default: return priority
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription_expiring': return <Clock className="size-4" />
      case 'subscription_overdue': return <AlertTriangle className="size-4" />
      case 'rental_overdue': return <BookOpen className="size-4" />
      default: return <Bell className="size-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subscription_expiring': return 'text-orange-600'
      case 'subscription_overdue': return 'text-red-600'
      case 'rental_overdue': return 'text-purple-600'
      default: return 'text-neutral-600'
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Bell className="size-5" />
            Сповіщення
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="size-6 animate-spin text-neutral-400" />
            <span className="ml-2 text-neutral-600">Завантаження сповіщень...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Bell className="size-5" />
            Сповіщення
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadNotifications} variant="outline">
              <RefreshCw className="size-4 mr-2" />
              Спробувати знову
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className="rounded-2xl border-neutral-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Bell className="size-5" />
            Сповіщення ({data.summary.total})
          </CardTitle>
          <Button onClick={loadNotifications} variant="outline" size="md">
            <RefreshCw className="size-4 mr-2" />
            Оновити
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Сводка */}
        {data.summary.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-h4 text-red-600">{data.summary.high_priority}</div>
              <div className="text-caption text-red-600">Високий пріоритет</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-h4 text-orange-600">{data.summary.medium_priority}</div>
              <div className="text-caption text-orange-600">Середній пріоритет</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-h4 text-brand-accent-light">{data.summary.expiring_subscriptions}</div>
              <div className="text-caption text-brand-accent-light">Закінчуються</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-h4 text-purple-600">{data.summary.overdue_rentals}</div>
              <div className="text-caption text-purple-600">Прострочені оренди</div>
            </div>
          </div>
        )}

        {/* Список уведомлений */}
        {data.notifications.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <CheckCircle className="size-16 mx-auto mb-4 opacity-50" />
            <p className="text-body-lg font-semibold text-neutral-700 mb-2">Немає сповіщень</p>
            <p className="text-neutral-500">Всі підписки та оренди в порядку</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border border-neutral-200 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)} bg-neutral-50`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{notification.title}</h3>
                      <p className="text-body-sm text-neutral-600">{notification.message}</p>
                    </div>
                  </div>
                  <Badge variant={getPriorityBadgeVariant(notification.priority)}>
                    {getPriorityText(notification.priority)}
                  </Badge>
                </div>

                {/* Детали пользователя */}
                {notification.user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-neutral-500" />
                        <span className="font-medium">{notification.user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {notification.user.subscription_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-neutral-500" />
                        <span>{notification.user.email}</span>
                      </div>
                      {notification.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-neutral-500" />
                          <span>{notification.user.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-neutral-600">
                      <div>
                        <span className="font-medium">Підписка до:</span> {new Date(notification.user.subscription_end).toLocaleDateString('uk-UA')}
                      </div>
                      {notification.daysLeft && (
                        <div className="text-orange-600 font-medium">
                          Залишилось: {notification.daysLeft} дн.
                        </div>
                      )}
                      {notification.daysOverdue && (
                        <div className="text-red-600 font-medium">
                          Прострочено на: {notification.daysOverdue} дн.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Детали аренды */}
                {notification.rental && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-neutral-500" />
                        <span className="font-medium">{notification.rental.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 text-neutral-500" />
                        <span>{notification.rental.book_title} ({notification.rental.book_code})</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-neutral-600">
                      <div>
                        <span className="font-medium">Повернути до:</span> {new Date(notification.rental.due_date).toLocaleDateString('uk-UA')}
                      </div>
                      {notification.daysOverdue && (
                        <div className="text-red-600 font-medium">
                          Прострочено на: {notification.daysOverdue} дн.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
