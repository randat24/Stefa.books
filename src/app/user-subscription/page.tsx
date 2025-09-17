'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Calendar, 
  CreditCard,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Truck
} from 'lucide-react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface UserSubscription {
  id: string
  plan: string
  status: 'active' | 'inactive' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  autoRenew: boolean
  nextBillingDate?: string
  totalBooks: number
  booksInUse: number
  booksAvailable: number
}

interface Rental {
  id: string
  bookTitle: string
  bookAuthor: string
  coverUrl: string
  startDate: string
  endDate: string
  status: 'active' | 'overdue' | 'returned'
  daysRemaining: number
}

export default function UserSubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      
      // Загружаем данные подписки
      const subscriptionResponse = await fetch('/api/user/subscription')
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setSubscription(subscriptionData)
      }

      // Загружаем активные аренды
      const rentalsResponse = await fetch('/api/user/rentals')
      if (rentalsResponse.ok) {
        const rentalsData = await rentalsResponse.json()
        setRentals(rentalsData)
      }
    } catch (error) {
      logger.error('Ошибка загрузки данных подписки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    if (confirm('Вы уверены, что хотите отменить подписку? Это действие нельзя отменить.')) {
      try {
        const response = await fetch(`/api/user/subscription/${subscription.id}/cancel`, {
          method: 'POST'
        })

        if (response.ok) {
          await loadSubscriptionData()
          logger.info('Подписка отменена')
        }
      } catch (error) {
        logger.error('Ошибка отмены подписки:', error)
      }
    }
  }

  const handleRenewSubscription = async () => {
    if (!subscription) return

    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_type: subscription.plan,
          renew: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.redirect_url) {
          window.location.href = result.redirect_url
        }
      }
    } catch (error) {
      logger.error('Ошибка продления подписки:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Активна</Badge>
      case 'inactive':
        return <Badge variant="secondary">Неактивна</Badge>
      case 'expired':
        return <Badge variant="destructive">Истекла</Badge>
      case 'cancelled':
        return <Badge variant="outline">Отменена</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getPlanInfo = (plan: string) => {
    const plans = {
      mini: { name: 'Mini', color: 'blue', books: 1 },
      maxi: { name: 'Maxi', color: 'purple', books: 2 },
      premium: { name: 'Premium', color: 'gold', books: 3 }
    }
    return plans[plan as keyof typeof plans] || { name: plan, color: 'gray', books: 0 }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных подписки...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Нет активной подписки</h2>
            <p className="text-gray-600 mb-6">
              Оформите подписку, чтобы получить доступ к тысячам детских книг
            </p>
            <Button asChild className="w-full">
              <Link href="/subscribe">Оформить подписку</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planInfo = getPlanInfo(subscription.plan)
  const daysRemaining = getDaysRemaining(subscription.endDate)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Моя подписка</h1>
          <p className="text-gray-600">Управление подпиской и арендой книг</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Подписка {planInfo.name}
                  </CardTitle>
                  {getStatusBadge(subscription.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Дата начала</p>
                    <p className="font-medium">{formatDate(subscription.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Дата окончания</p>
                    <p className="font-medium">{formatDate(subscription.endDate)}</p>
                  </div>
                </div>

                {subscription.status === 'active' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {daysRemaining > 0 ? `Осталось ${daysRemaining} дней` : 'Подписка истекла'}
                      </span>
                    </div>
                    {daysRemaining <= 7 && daysRemaining > 0 && (
                      <p className="text-sm text-blue-700">
                        Подписка скоро истекает. Продлите её, чтобы не потерять доступ к книгам.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {subscription.status === 'active' && daysRemaining > 0 && (
                    <Button onClick={handleRenewSubscription} variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Продлить подписку
                    </Button>
                  )}
                  
                  {subscription.status === 'active' && (
                    <Button onClick={handleCancelSubscription} variant="destructive">
                      <Settings className="h-4 w-4 mr-2" />
                      Отменить подписку
                    </Button>
                  )}
                  
                  {subscription.status === 'expired' && (
                    <Button asChild>
                      <Link href="/subscribe">
                        <Crown className="h-4 w-4 mr-2" />
                        Продлить подписку
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Books Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Использование книг
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{subscription.booksInUse}</div>
                    <div className="text-sm text-gray-600">В использовании</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{subscription.booksAvailable}</div>
                    <div className="text-sm text-gray-600">Доступно</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{planInfo.books}</div>
                    <div className="text-sm text-gray-600">Лимит плана</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(subscription.booksInUse / planInfo.books) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Active Rentals */}
            <Card>
              <CardHeader>
                <CardTitle>Активные аренды</CardTitle>
              </CardHeader>
              <CardContent>
                {rentals.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Нет активных аренд</p>
                    <Button asChild className="mt-4">
                      <Link href="/catalog">Посмотреть каталог</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rentals.map((rental) => (
                      <div key={rental.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={rental.coverUrl || '/placeholder-book.jpg'}
                          alt={rental.bookTitle}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{rental.bookTitle}</h4>
                          <p className="text-sm text-gray-600">{rental.bookAuthor}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500">
                              До {formatDate(rental.endDate)}
                            </span>
                            <Badge variant={rental.daysRemaining <= 3 ? 'destructive' : 'default'}>
                              {rental.daysRemaining} дней
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Вернуть
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/catalog">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Каталог книг
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/payment">
                    <CreditCard className="h-4 w-4 mr-2" />
                    История платежей
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки профиля
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plan Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Преимущества плана {planInfo.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{planInfo.books} книга одновременно</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Доставка по Украине</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Поддержка 24/7</span>
                </div>
                {subscription.plan === 'premium' && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Персональный менеджер</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Эксклюзивные издания</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Нужна помощь?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Наша команда поддержки всегда готова помочь с любыми вопросами.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Связаться с поддержкой
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
