"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, TrendingUp, Users, BookOpen, CreditCard, RefreshCw, 
  DollarSign, Calendar, Activity, Target, Award, Zap,
  ArrowUpRight, ArrowDownRight, Minus, Eye, Download
} from "lucide-react"

interface AdvancedAnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalBooks: number
    availableBooks: number
    totalRentals: number
    activeRentals: number
    overdueRentals: number
    totalRevenue: number
    monthlyRevenue: number
    weeklyRevenue: number
    averageRentalDuration: number
    userRetentionRate: number
    bookUtilizationRate: number
  }
  trends: {
    userGrowth: Array<{ date: string; count: number }>
    revenueGrowth: Array<{ date: string; amount: number }>
    rentalActivity: Array<{ date: string; count: number }>
  }
  popularBooks: Array<{
    id: string
    title: string
    author: string
    code: string
    rental_count: number
    revenue: number
    rating: number
  }>
  topUsers: Array<{
    id: string
    name: string
    email: string
    total_rentals: number
    total_spent: number
    last_activity: string
  }>
  recentActivity: Array<{
    id: string
    type: 'rental' | 'return' | 'subscription' | 'payment'
    user_name: string
    book_title?: string
    amount?: number
    timestamp: string
  }>
  performance: {
    averageResponseTime: number
    systemUptime: number
    errorRate: number
    cacheHitRate: number
  }
}

interface AdvancedAnalyticsProps {
  onRefresh?: () => void
}

export function AdvancedAnalytics({ onRefresh }: AdvancedAnalyticsProps) {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError('Помилка завантаження аналітики')
      }
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Помилка завантаження аналітики')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, loadAnalytics])

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="size-4 text-green-600" />
    if (current < previous) return <ArrowDownRight className="size-4 text-red-600" />
    return <Minus className="size-4 text-neutral-600" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-green-600"
    if (current < previous) return "text-red-600"
    return "text-neutral-600"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-neutral-900 flex items-center gap-2">
              <BarChart3 className="size-5" />
              Розширена аналітика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-6 animate-spin text-neutral-400" />
              <span className="ml-2 text-neutral-600">Завантаження аналітики...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-neutral-900 flex items-center gap-2">
              <BarChart3 className="size-5" />
              Розширена аналітика
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

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Заголовок з фільтрами */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-neutral-900 flex items-center gap-2">
              <BarChart3 className="size-5" />
              Розширена аналітика
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-body-sm text-neutral-600">Період:</span>
                <select
                  value={timeRange}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="7d">7 днів</option>
                  <option value="30d">30 днів</option>
                  <option value="90d">90 днів</option>
                </select>
              </div>
              <Button onClick={loadAnalytics} variant="outline" size="md">
                <RefreshCw className="size-4 mr-2" />
                Оновити
              </Button>
              <Button onClick={() => {}} variant="outline" size="md">
                <Download className="size-4 mr-2" />
                Експорт
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Основні метрики */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-body-sm font-semibold text-neutral-700">Користувачі</CardTitle>
            <Users className="h-5 w-5 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 text-brand-accent-light">
              {data.overview.activeUsers}
            </div>
            <p className="text-caption text-neutral-500 mt-1">
              з {data.overview.totalUsers} загалом
            </p>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(data.overview.activeUsers, data.overview.totalUsers * 0.8)}
              <span className={`text-caption ${getTrendColor(data.overview.activeUsers, data.overview.totalUsers * 0.8)}`}>
                {formatPercentage(data.overview.userRetentionRate)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-body-sm font-semibold text-neutral-700">Доходи (місяць)</CardTitle>
            <CreditCard className="h-5 w-5 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 text-purple-600">
              {formatCurrency(data.overview.monthlyRevenue)}
            </div>
            <p className="text-caption text-neutral-500 mt-1">
              Загалом: {formatCurrency(data.overview.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(data.overview.monthlyRevenue, data.overview.weeklyRevenue * 4)}
              <span className={`text-caption ${getTrendColor(data.overview.monthlyRevenue, data.overview.weeklyRevenue * 4)}`}>
                +{Math.round(((data.overview.monthlyRevenue - data.overview.weeklyRevenue * 4) / (data.overview.weeklyRevenue * 4)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-body-sm font-semibold text-neutral-700">Активні оренди</CardTitle>
            <BookOpen className="h-5 w-5 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 text-green-600">
              {data.overview.activeRentals}
            </div>
            <p className="text-caption text-neutral-500 mt-1">
              {data.overview.overdueRentals > 0 && (
                <span className="text-red-600">
                  {data.overview.overdueRentals} просрочених
                </span>
              )}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="size-3 text-neutral-500" />
              <span className="text-caption text-neutral-600">
                {data.overview.averageRentalDuration} дн. середнє
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-body-sm font-semibold text-neutral-700">Використання книг</CardTitle>
            <Target className="h-5 w-5 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 text-indigo-600">
              {formatPercentage(data.overview.bookUtilizationRate)}
            </div>
            <p className="text-caption text-neutral-500 mt-1">
              {data.overview.availableBooks} доступно з {data.overview.totalBooks}
            </p>
            <div className="w-full bg-neutral-200 rounded-2xl h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-2xl transition-all duration-500" 
                style={{ width: `${data.overview.bookUtilizationRate * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Популярні книги */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Award className="size-5" />
            Популярні книги
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.popularBooks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <BookOpen className="size-12 mx-auto mb-3 opacity-50" />
              <p>Немає даних про популярність</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.popularBooks.slice(0, 5).map((book, index) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-accent text-neutral-0 rounded-2xl font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{book.title}</h3>
                      <p className="text-body-sm text-neutral-600">{book.author} • {book.article}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-neutral-900">{book.rental_count}</div>
                      <div className="text-neutral-500">оренд</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{formatCurrency(book.revenue)}</div>
                      <div className="text-neutral-500">дохід</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="size-4 text-yellow-500" />
                      <span className="font-medium">{book.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Топ користувачі */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Users className="size-5" />
            Топ користувачі
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topUsers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Users className="size-12 mx-auto mb-3 opacity-50" />
              <p>Немає даних про користувачів</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topUsers.slice(0, 5).map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-neutral-100 text-neutral-700 rounded-2xl font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{user.name}</h3>
                      <p className="text-body-sm text-neutral-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-neutral-900">{user.total_rentals}</div>
                      <div className="text-neutral-500">оренд</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{formatCurrency(user.total_spent)}</div>
                      <div className="text-neutral-500">витрачено</div>
                    </div>
                    <div className="text-neutral-500 text-xs">
                      {new Date(user.last_activity).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Остання активність */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Activity className="size-5" />
            Остання активність
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Activity className="size-12 mx-auto mb-3 opacity-50" />
              <p>Немає недавньої активності</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
                      activity.type === 'rental' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'return' ? 'bg-green-100 text-green-600' :
                      activity.type === 'subscription' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'rental' ? <BookOpen className="size-4" /> :
                       activity.type === 'return' ? <RefreshCw className="size-4" /> :
                       activity.type === 'subscription' ? <Users className="size-4" /> :
                       <CreditCard className="size-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{activity.user_name}</p>
                      <p className="text-body-sm text-neutral-600">
                        {activity.type === 'rental' ? 'Орендував' :
                         activity.type === 'return' ? 'Повернув' :
                         activity.type === 'subscription' ? 'Оновив підписку' :
                         'Зробив платіж'}
                        {activity.book_title && ` "${activity.book_title}"`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="font-semibold text-green-600">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                    <p className="text-caption text-neutral-500">
                      {new Date(activity.timestamp).toLocaleString('uk-UA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Продуктивність системи */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Zap className="size-5" />
            Продуктивність системи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-h2 text-green-600">
                {data.performance.averageResponseTime}мс
              </div>
              <div className="text-body-sm text-green-600">Середній час відповіді</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-h2 text-blue-600">
                {formatPercentage(data.performance.systemUptime)}
              </div>
              <div className="text-body-sm text-blue-600">Час роботи системи</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-h2 text-red-600">
                {formatPercentage(data.performance.errorRate)}
              </div>
              <div className="text-body-sm text-red-600">Частота помилок</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-h2 text-purple-600">
                {formatPercentage(data.performance.cacheHitRate)}
              </div>
              <div className="text-body-sm text-purple-600">Ефективність кешу</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
