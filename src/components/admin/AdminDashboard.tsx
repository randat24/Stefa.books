"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, BookOpen, Users, CreditCard, TrendingUp, RefreshCw, CheckCircle, 
  AlertTriangle, Clock, Activity, Target, Award, Zap, BarChart3, Calendar,
  ArrowUpRight, ArrowDownRight, Minus, Eye, Download, Settings, Bell
} from "lucide-react"
// Dynamic import for AdvancedAnalytics as well
const AdvancedAnalytics = dynamic(() => import("./AdvancedAnalytics").then(mod => ({ default: mod.AdvancedAnalytics })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-2xl h-6 w-6 border-b-2 border-gray-900"></div>
    </div>
  )
})
import dynamic from 'next/dynamic'

// Dynamically load heavy admin components
const EnhancedBooksManager = dynamic(() => import("./EnhancedBooksManager").then(mod => ({ default: mod.EnhancedBooksManager })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
})
// Dynamic import for UserManagement
const UserManagement = dynamic(() => import("./UserManagement").then(mod => ({ default: mod.UserManagement })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
})
import { NotificationsPanel } from "../admin/NotificationsPanel"
import type { BookRow, UserRow } from "@/lib/types/admin"

interface DashboardData {
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
  }
  recentActivity: Array<{
    id: string
    type: 'rental' | 'return' | 'subscription' | 'payment' | 'user_registration'
    user_name: string
    book_title?: string
    amount?: number
    timestamp: string
  }>
  alerts: Array<{
    id: string
    type: 'warning' | 'error' | 'info' | 'success'
    title: string
    message: string
    timestamp: string
  }>
  quickStats: {
    booksAddedToday: number
    usersRegisteredToday: number
    rentalsToday: number
    revenueToday: number
  }
}

interface AdminDashboardProps {
  books: BookRow[]
  users: UserRow[]
  onRefresh: () => void
  onBookCreated: () => void
}

export function AdminDashboard({ books, users, onRefresh, onBookCreated }: AdminDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'users' | 'analytics'>('overview')

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError('Помилка завантаження дашборду')
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Помилка завантаження дашборду')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="size-4 text-green-600" />
    if (current < previous) return <ArrowDownRight className="size-4 text-red-600" />
    return <Minus className="size-4 text-gray-600" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-green-600"
    if (current < previous) return "text-red-600"
    return "text-gray-600"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rental': return <BookOpen className="size-4 text-blue-600" />
      case 'return': return <RefreshCw className="size-4 text-green-600" />
      case 'subscription': return <Users className="size-4 text-purple-600" />
      case 'payment': return <CreditCard className="size-4 text-yellow-600" />
      case 'user_registration': return <Users className="size-4 text-indigo-600" />
      default: return <Activity className="size-4 text-gray-600" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="size-4 text-orange-600" />
      case 'error': return <AlertTriangle className="size-4 text-red-600" />
      case 'info': return <Clock className="size-4 text-blue-600" />
      case 'success': return <CheckCircle className="size-4 text-green-600" />
      default: return <Bell className="size-4 text-gray-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm">
          <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            <div className="flex items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Завантаження дашборду...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm">
          <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadDashboardData} variant="outline">
                <RefreshCw className="size-4 mr-2" />
                Спробувати знову
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm">
        <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Building2 className="size-7 text-gray-600"/>
              </div>
              <div>
                <div className="text-body-sm text-gray-500 font-medium">Адмін‑панель</div>
                <h1 className="text-h1 tracking-tight text-gray-900">
                  Stefa.books — Управління
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-2 px-3 py-1">
                <CheckCircle className="size-4" />
                <span className="hidden sm:inline">Система працює</span>
                <span className="sm:hidden">ОК</span>
              </Badge>
              <Button
                variant="outline"
                size="md"
                onClick={onRefresh}
                className="hidden sm:flex"
              >
                <RefreshCw className="size-4 mr-2" />
                Оновити
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Навігація */}
      <div className="border-b border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="w-full px-4 py-4 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex items-center gap-1">
            <Button
              variant={activeTab === 'overview' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="size-4" />
              Огляд
            </Button>
            <Button
              variant={activeTab === 'books' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('books')}
              className="flex items-center gap-2"
            >
              <BookOpen className="size-4" />
              Книги
            </Button>
            <Button
              variant={activeTab === 'users' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-2"
            >
              <Users className="size-4" />
              Користувачі
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="size-4" />
              Аналітика
            </Button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
        {activeTab === 'overview' && data && (
          <div className="space-y-6">
            {/* Основні метрики */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-body-sm font-semibold text-gray-700">Користувачі</CardTitle>
                  <Users className="h-5 w-5 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-h2 text-brand-accent-light">
                    {data.overview.activeUsers}
                  </div>
                  <p className="text-caption text-gray-500 mt-1">
                    з {data.overview.totalUsers} загалом
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(data.overview.activeUsers, data.overview.totalUsers * 0.8)}
                    <span className={`text-caption ${getTrendColor(data.overview.activeUsers, data.overview.totalUsers * 0.8)}`}>
                      +{Math.round(((data.overview.activeUsers - data.overview.totalUsers * 0.8) / (data.overview.totalUsers * 0.8)) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-body-sm font-semibold text-gray-700">Активні оренди</CardTitle>
                  <BookOpen className="h-5 w-5 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-h2 text-green-600">
                    {data.overview.activeRentals}
                  </div>
                  <p className="text-caption text-gray-500 mt-1">
                    {data.overview.overdueRentals > 0 && (
                      <span className="text-red-600">
                        {data.overview.overdueRentals} просрочених
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-body-sm font-semibold text-gray-700">Доходи (місяць)</CardTitle>
                  <CreditCard className="h-5 w-5 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-h2 text-purple-600">
                    {formatCurrency(data.overview.monthlyRevenue)}
                  </div>
                  <p className="text-caption text-gray-500 mt-1">
                    Загалом: {formatCurrency(data.overview.totalRevenue)}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-body-sm font-semibold text-gray-700">Книги</CardTitle>
                  <BookOpen className="h-5 w-5 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-h2 text-indigo-600">
                    {data.overview.availableBooks}
                  </div>
                  <p className="text-caption text-gray-500 mt-1">
                    з {data.overview.totalBooks} загалом
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Швидка статистика */}
            <Card className="rounded-2xl border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Zap className="size-5" />
                  Сьогодні
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-h2 text-blue-600">{data.quickStats.booksAddedToday}</div>
                    <div className="text-body-sm text-blue-600">Книг додано</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-h2 text-green-600">{data.quickStats.usersRegisteredToday}</div>
                    <div className="text-body-sm text-green-600">Користувачів зареєстровано</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-h2 text-purple-600">{data.quickStats.rentalsToday}</div>
                    <div className="text-body-sm text-purple-600">Оренд</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <div className="text-h2 text-yellow-600">{formatCurrency(data.quickStats.revenueToday)}</div>
                    <div className="text-body-sm text-yellow-600">Дохід</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Остання активність */}
              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Activity className="size-5" />
                    Остання активність
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="size-12 mx-auto mb-3 opacity-50" />
                      <p>Немає недавньої активності</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.recentActivity.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-2xl flex items-center justify-center">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.user_name}</p>
                              <p className="text-body-sm text-gray-600">
                                {activity.type === 'rental' ? 'Орендував' :
                                 activity.type === 'return' ? 'Повернув' :
                                 activity.type === 'subscription' ? 'Оновив підписку' :
                                 activity.type === 'payment' ? 'Зробив платіж' :
                                 'Зареєструвався'}
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
                            <p className="text-caption text-gray-500">
                              {new Date(activity.timestamp).toLocaleString('uk-UA')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Сповіщення */}
              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Bell className="size-5" />
                    Сповіщення
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="size-12 mx-auto mb-3 opacity-50" />
                      <p>Немає сповіщень</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.alerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {getAlertIcon(alert.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{alert.title}</h4>
                              <p className="text-body-sm text-gray-600 mt-1">{alert.message}</p>
                              <p className="text-caption text-gray-500 mt-2">
                                {new Date(alert.timestamp).toLocaleString('uk-UA')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Сповіщення панель */}
            <NotificationsPanel onRefresh={onRefresh} />
          </div>
        )}

        {activeTab === 'books' && (
          <EnhancedBooksManager 
            books={books} 
            onRefresh={onRefresh} 
            onBookCreated={onBookCreated} 
          />
        )}

        {activeTab === 'users' && (
          <UserManagement 
            users={users} 
            onRefresh={onRefresh} 
          />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics onRefresh={onRefresh} />
        )}
      </div>
    </div>
  )
}
