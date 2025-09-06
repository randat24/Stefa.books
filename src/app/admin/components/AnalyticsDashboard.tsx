"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, BookOpen, CreditCard, RefreshCw, DollarSign } from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  totalBooks: number
  availableBooks: number
  totalRentals: number
  activeRentals: number
  overdueRentals: number
  totalRevenue: number
  monthlyRevenue: number
  averageRentalDuration: number
  popularBooks: Array<{
    title: string
    code: string
    rental_count: number
  }>
  recentPayments: Array<{
    user_name: string
    amount: number
    payment_date: string
    status: string
  }>
}

interface AnalyticsDashboardProps {
  onRefresh?: () => void
}

export function AnalyticsDashboard({ }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Загружаем данные из разных API
      const [usersRes, booksRes, rentalsRes, paymentsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/books'),
        fetch('/api/admin/rentals'),
        fetch('/api/admin/payments')
      ])
      
      const [usersData, booksData, rentalsData, paymentsData] = await Promise.all([
        usersRes.json(),
        booksRes.json(),
        rentalsRes.json(),
        paymentsRes.json()
      ])
      
      // Формируем аналитику
      const analyticsData: AnalyticsData = {
        totalUsers: usersData.data?.length || 0,
        activeUsers: usersData.data?.filter((u: any) => u.status === 'active').length || 0,
        totalBooks: booksData.data?.length || 0,
        availableBooks: booksData.data?.filter((b: any) => b.available).length || 0,
        totalRentals: rentalsData.data?.length || 0,
        activeRentals: rentalsData.data?.filter((r: any) => r.status === 'active').length || 0,
        overdueRentals: rentalsData.data?.filter((r: any) => r.status === 'overdue').length || 0,
        totalRevenue: paymentsData.data?.reduce((sum: number, p: any) => sum + (p.amount_uah || 0), 0) || 0,
        monthlyRevenue: paymentsData.data?.filter((p: any) => {
          const paymentDate = new Date(p.payment_date)
          const now = new Date()
          return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
        }).reduce((sum: number, p: any) => sum + (p.amount_uah || 0), 0) || 0,
        averageRentalDuration: 0, // Пока 0, добавим позже
        popularBooks: [], // Пока пустой, добавим позже
        recentPayments: paymentsData.data?.slice(0, 5).map((p: any) => ({
          user_name: p.user_name || 'Невідомий',
          amount: p.amount_uah || 0,
          payment_date: p.payment_date,
          status: p.status
        })) || []
      }
      
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Помилка завантаження аналітики')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <BarChart3 className="size-5" />
              Аналітика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Завантаження аналітики...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <BarChart3 className="size-5" />
              Аналітика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadAnalytics} variant="outline">
                <RefreshCw className="size-4 mr-2" />
                Спробувати знову
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Користувачі</CardTitle>
            <Users className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent-light">
              {analytics.activeUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              з {analytics.totalUsers} загалом
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Активні оренди</CardTitle>
            <BookOpen className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.activeRentals}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.overdueRentals > 0 && (
                <span className="text-red-600">
                  {analytics.overdueRentals} просрочених
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Доходи (місяць)</CardTitle>
            <CreditCard className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.monthlyRevenue.toLocaleString('uk-UA')} ₴
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Загалом: {analytics.totalRevenue.toLocaleString('uk-UA')} ₴
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Книги</CardTitle>
            <BookOpen className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {analytics.availableBooks}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              з {analytics.totalBooks} загалом
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Останні платежі */}
      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <DollarSign className="size-5" />
              Останні платежі
            </CardTitle>
            <Button onClick={loadAnalytics} variant="outline" size="md">
              <RefreshCw className="size-4 mr-2" />
              Оновити
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analytics.recentPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="size-12 mx-auto mb-3 opacity-50" />
              <p>Немає платежів</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="size-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.user_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {payment.amount.toLocaleString('uk-UA')} ₴
                    </p>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status === 'completed' ? 'Оплачено' : payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статистика використання */}
      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <TrendingUp className="size-5" />
            Статистика використання
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Використання книг</span>
                <span className="font-semibold">
                  {analytics.totalBooks > 0 ? Math.round(((analytics.totalBooks - analytics.availableBooks) / analytics.totalBooks) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-brand-accent-light h-2 rounded-full" 
                  style={{ 
                    width: `${analytics.totalBooks > 0 ? ((analytics.totalBooks - analytics.availableBooks) / analytics.totalBooks) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Активність користувачів</span>
                <span className="font-semibold">
                  {analytics.totalUsers > 0 ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${analytics.totalUsers > 0 ? (analytics.activeUsers / analytics.totalUsers) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}