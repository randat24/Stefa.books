"use client"

import { useState, useEffect } from "react"
import { Building2, BookOpen, Users, CreditCard, TrendingUp, CheckCircle, FileText, Calendar, BarChart3, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { BooksTable } from "./components/BooksTable"
import type { AdminDashboardData } from "@/lib/types/admin"

// ============================================================================
// АДМІН-ПАНЕЛЬ STEFA.BOOKS
// ============================================================================

export default function AdminPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // ============================================================================
  // ЗАВАНТАЖЕННЯ ДАНИХ
  // ============================================================================

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Admin page: Starting to load data...')
      
      // Временно используем статические данные
      const staticData = {
        stats: {
          totalBooks: 19,
          availableBooks: 16,
          activeUsers: 25,
          totalRevenue: 8500,
          totalBooksCost: 3200
        },
        books: [
          {
            id: 'temp-1',
            code: 'DL-001',
            title: 'Тестовая книга',
            author: 'Тестовый автор',
            category_id: 'children-literature',
            category_name: 'Дитяча література',
            subcategory: null,
            description: 'Это тестовая книга для проверки админ-панели',
            short_description: 'Тестовое описание',
            isbn: null,
            pages: 100,
            age_range: '6+',
            language: 'Ukrainian',
            publisher: null,
            publication_year: null,
            cover_url: '/images/books/test.jpg',
            status: 'available' as const,
            available: true,
            qty_total: 1,
            qty_available: 1,
            price_uah: 150,
            location: 'Тестовая локация',
            rating: 4.5,
            rating_count: 10,
            badges: ['Тест'],
            tags: ['тест'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        users: [],
        rentals: [],
        payments: []
      }
      
      console.log('✅ Static data ready:', staticData)
      
      // Имитируем задержку загрузки
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setData(staticData)
      console.log('✅ Data set to state!')
      
    } catch (err) {
      console.error('💥 Failed to load admin data:', err)
      setError('Помилка завантаження даних. Спробуйте перезавантажити сторінку.')
    } finally {
      setLoading(false)
      console.log('🏁 Loading finished!')
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true)
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ============================================================================
  // ОБРОБНИКИ ПОДІЙ
  // ============================================================================

  function handleBookCreated() {
    loadData()
  }

  // ============================================================================
  // РЕНДЕР СТОРІНКИ
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-2xl h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="text-gray-600 text-body-lg font-medium">Завантаження адмін-панелі...</p>
          <p className="text-gray-500 text-sm">Будь ласка, зачекайте</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="size-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-h3 text-gray-900 mb-2">Помилка завантаження</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="size-4 mr-2 animate-spin" />
                    Оновлення...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4 mr-2" />
                    Спробувати знову
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Перезавантажити сторінку
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
      <div className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm">
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
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden sm:flex"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="size-4 mr-2 animate-spin" />
                    Оновлення
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4 mr-2" />
                    Оновити
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Основний контент */}
      <div className="w-full px-4 py-8 lg:px-6 xl:px-8 2xl:px-10">
        <div className="space-y-8">
          
          {/* KPI метрики */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-gray-700">Книги в наявності</CardTitle>
                <BookOpen className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-green-600">
                  {data?.stats.availableBooks || 0}
                </div>
                <p className="text-caption text-gray-500 mt-1">
                  з {data?.stats.totalBooks || 0} загалом
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-gray-700">Активні користувачі</CardTitle>
                <Users className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-brand-accent-light">
                  {data?.stats.activeUsers || 0}
                </div>
                <p className="text-caption text-gray-500 mt-1">
                  підписників
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-gray-700">Доходи (місяць)</CardTitle>
                <CreditCard className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-purple-600">
                  {(data?.stats.totalRevenue || 0).toLocaleString('uk-UA')} ₴
                </div>
                <p className="text-caption text-gray-500 mt-1">
                  Витрати: {(data?.stats.totalBooksCost || 0).toLocaleString('uk-UA')} ₴
                </p>
                <p className="text-caption text-green-600 font-medium mt-1">
                  Прибуток: {((data?.stats.totalRevenue || 0) - (data?.stats.totalBooksCost || 0)).toLocaleString('uk-UA')} ₴
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-gray-700">РОІ (окупність)</CardTitle>
                <TrendingUp className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-orange-600">
                  {data?.stats.totalBooksCost ? Math.round(((data?.stats.totalRevenue || 0) / data.stats.totalBooksCost) * 100) : 0}%
                </div>
                <p className="text-caption text-gray-500 mt-1">
                  повернення інвестицій
                </p>
              </CardContent>
            </Card>

            {/* Додаткові метрики для широких екранів */}
            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow hidden 2xl:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-gray-700">Середня ціна</CardTitle>
                <FileText className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-indigo-600">
                  {data?.stats.totalBooks ? Math.round((data?.stats.totalBooksCost || 0) / data.stats.totalBooks) : 0} ₴
                </div>
                <p className="text-caption text-gray-500 mt-1">
                  за книгу в колекції
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow hidden 2xl:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-gray-700">Використання</CardTitle>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-teal-600">
                  {data?.stats.totalBooks ? Math.round(((data?.stats.totalBooks - data?.stats.availableBooks) / data.stats.totalBooks) * 100) : 0}%
                </div>
                <p className="text-caption text-gray-500 mt-1">
                  книг зараз у читачів
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Головні таби */}
          <Tabs defaultValue="books" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-gray-100 p-1">
              <TabsTrigger value="books" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BookOpen className="size-4" />
                <span className="hidden sm:inline">Книги</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="size-4" />
                <span className="hidden sm:inline">Користувачі</span>
              </TabsTrigger>
              <TabsTrigger value="rentals" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="size-4" />
                <span className="hidden sm:inline">Оренди</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Звіти</span>
              </TabsTrigger>
            </TabsList>

            {/* Таб книг */}
            <TabsContent value="books" className="space-y-4">
              <BooksTable
                books={data?.books || []}
                onRefresh={handleRefresh}
                onBookCreated={handleBookCreated}
              />
            </TabsContent>

            {/* Таб користувачів */}
            <TabsContent value="users" className="space-y-4">
              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Управління користувачами</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Users className="size-16 mx-auto mb-4 opacity-50" />
                    <p className="text-body-lg font-semibold text-gray-700 mb-2">Користувачі</p>
                    <p className="text-gray-500">Управління підписниками (в розробці)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Таб орендувань */}
            <TabsContent value="rentals" className="space-y-4">
              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Управління орендами</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="size-16 mx-auto mb-4 opacity-50" />
                    <p className="text-body-lg font-semibold text-gray-700 mb-2">Орендні записи</p>
                    <p className="text-gray-500">Відстеження видачі та повернень (в розробці)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Таб звітів */}
            <TabsContent value="reports" className="space-y-4">
              <Card className="rounded-2xl border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Звіти та аналітика</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="size-16 mx-auto mb-4 opacity-50" />
                    <p className="text-body-lg font-semibold text-gray-700 mb-2">Аналітика</p>
                    <p className="text-gray-500">Фінансові звіти та статистика (в розробці)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}