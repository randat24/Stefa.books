'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { logger } from '@/lib/logger'

interface DashboardStats {
  totalUsers: number
  activeSubscriptions: number
  pendingRequests: number
  totalBooks: number
  monthlyRevenue: number
}

interface SubscriptionRequest {
  id: string
  name: string
  email: string
  phone: string
  plan: string
  payment_method: string
  status: string
  created_at: string
  admin_notes?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingRequests: 0,
    totalBooks: 0,
    monthlyRevenue: 0
  })
  const [recentRequests, setRecentRequests] = useState<SubscriptionRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Загружаем статистику
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Загружаем последние заявки
      const requestsResponse = await fetch('/api/admin/subscription-requests?limit=10')
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRecentRequests(requestsData)
      }

    } catch (error) {
      logger.error('Ошибка загрузки данных админ-панели:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/subscription-requests/${requestId}/approve`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadDashboardData()
        logger.info('Заявка одобрена:', requestId)
      }
    } catch (error) {
      logger.error('Ошибка одобрения заявки:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/subscription-requests/${requestId}/reject`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadDashboardData()
        logger.info('Заявка отклонена:', requestId)
      }
    } catch (error) {
      logger.error('Ошибка отклонения заявки:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Завершено</Badge>
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Ожидает</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Отклонено</Badge>
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Неизвестно</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      mini: 'bg-blue-100 text-blue-800',
      maxi: 'bg-purple-100 text-purple-800',
      premium: 'bg-gold-100 text-gold-800'
    }
    return <Badge className={colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{plan.toUpperCase()}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
          <p className="mt-2 text-gray-600">Управление подписками и пользователями</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активные подписки</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ожидают обработки</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего книг</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Доход за месяц</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue} ₴</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Последние заявки на подписку</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      План
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Способ оплаты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                          <div className="text-sm text-gray-500">{request.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(request.plan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.payment_method === 'monobank' ? 'Monobank' : 
                         request.payment_method === 'online' ? 'Онлайн' : 'Наличные'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('uk-UA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Одобрить
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              Отклонить
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}