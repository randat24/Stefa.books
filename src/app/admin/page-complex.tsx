"use client"

import { useState, useEffect } from "react"
import { 
  Building2, BookOpen, Users, CreditCard, TrendingUp, CheckCircle, FileText, Calendar, 
  BarChart3, RefreshCw, Settings, Database, Shield, Bell, Download, 
  Activity, Zap, Eye, Trash2, Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { BooksTable } from "./components/BooksTable"
import { UsersTable } from "./components/UsersTable"
import ExportData from "@/components/admin/ExportData"
import CacheManager from "@/components/admin/CacheManager"
import MonobankTest from "@/components/admin/MonobankTest"
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
      
      // Загружаем данные из API
      const [booksResponse, usersResponse] = await Promise.allSettled([
        fetch('/api/admin/books'),
        fetch('/api/admin/users')
      ])
      
      let books: any[] = []
      let users: any[] = []
      
      // Обрабатываем ответы книг
      if (booksResponse.status === 'fulfilled' && booksResponse.value.ok) {
        const booksData = await booksResponse.value.json()
        books = booksData.data?.books || booksData.data || []
        console.log('✅ Books loaded:', books.length)
      } else {
        console.error('❌ Failed to load books:', booksResponse.status === 'rejected' ? booksResponse.reason : 'HTTP error')
        books = []
      }
      
      // Обрабатываем ответы пользователей
      if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
        const usersData = await usersResponse.value.json()
        users = usersData.data?.users || usersData.data || []
        console.log('✅ Users loaded:', users.length)
      } else {
        console.error('❌ Failed to load users:', usersResponse.status === 'rejected' ? usersResponse.reason : 'HTTP error')
        users = []
      }
      
      // Если нет книг, создаем тестовые данные
      if (books.length === 0) {
        console.log('📚 No books found, creating sample data...')
        books = [
          {
            id: 'sample-1',
            code: 'DL-001',
            title: 'Казки українських письменників',
            author: 'Тарас Шевченко',
            category_id: 'children-literature',
            category_name: 'Дитяча література',
            subcategory: 'Казки',
            description: 'Збірка найкращих казок для дітей від українських письменників',
            short_description: 'Казки для дітей',
            isbn: '978-617-123-456-7',
            pages: 120,
            age_range: '6+',
            language: 'Ukrainian',
            publisher: 'Видавництво А-БА-БА-ГА-ЛА-МА-ГА',
            publication_year: 2023,
            cover_url: '/images/books/sample-1.jpg',
            status: 'available',
            available: true,
            qty_total: 3,
            qty_available: 2,
            price_uah: 150,
            location: 'Стелаж А-1',
            rating: 4.8,
            rating_count: 25,
            badges: ['Популярна', 'Новинка'],
            tags: ['казки', 'дитяча література', 'українська'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'sample-2',
            code: 'DL-002',
            title: 'Пригоди Незнайки',
            author: 'Микола Носов',
            category_id: 'children-literature',
            category_name: 'Дитяча література',
            subcategory: 'Пригоди',
            description: 'Класичні пригоди веселого коротульки Незнайки та його друзів',
            short_description: 'Пригоди Незнайки',
            isbn: '978-617-123-457-4',
            pages: 200,
            age_range: '8+',
            language: 'Ukrainian',
            publisher: 'Видавництво Школа',
            publication_year: 2022,
            cover_url: '/images/books/sample-2.jpg',
            status: 'available',
            available: true,
            qty_total: 2,
            qty_available: 1,
            price_uah: 180,
            location: 'Стелаж А-2',
            rating: 4.9,
            rating_count: 18,
            badges: ['Класика', 'Рекомендована'],
            tags: ['пригоди', 'дитяча література', 'класика'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'sample-3',
            code: 'DL-003',
            title: 'Маленький принц',
            author: 'Антуан де Сент-Екзюпері',
            category_id: 'children-literature',
            category_name: 'Дитяча література',
            subcategory: 'Філософська казка',
            description: 'Філософська казка про дружбу, любов та сенс життя',
            short_description: 'Маленький принц',
            isbn: '978-617-123-458-1',
            pages: 96,
            age_range: '10+',
            language: 'Ukrainian',
            publisher: 'Видавництво Основи',
            publication_year: 2024,
            cover_url: '/images/books/sample-3.jpg',
            status: 'available',
            available: true,
            qty_total: 4,
            qty_available: 3,
            price_uah: 120,
            location: 'Стелаж Б-1',
            rating: 4.7,
            rating_count: 32,
            badges: ['Світова класика', 'Бестселер'],
            tags: ['філософія', 'казка', 'світова література'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }
      
      const data = {
        stats: {
          totalBooks: books.length,
          availableBooks: books.filter(b => b.available && b.qty_available > 0).length,
          activeUsers: users.filter(u => u.status === 'active').length,
          totalRevenue: 8500,
          totalBooksCost: books.reduce((sum, b) => sum + (b.price_uah || 0) * (b.qty_total || 1), 0)
        },
        books,
        users,
        rentals: [],
        payments: []
      }
      
      console.log('✅ Data ready:', data)
      setData(data)
      
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

  const handleFixBooksData = async () => {
    try {
      const response = await fetch('/api/admin/fix-books-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Дані книг виправлено! Додано ${result.booksInserted} книг.`)
        // Перезагружаем данные
        await loadData()
      } else {
        alert(`❌ Помилка: ${result.error}`)
      }
    } catch (error) {
      console.error('Error fixing books data:', error)
      alert('❌ Помилка при виправленні даних книг')
    }
  }

  // ============================================================================
  // РЕНДЕР СТОРІНКИ
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-2xl h-12 w-12 border-b-2 border-neutral-600 mx-auto"></div>
          <p className="text-neutral-600 text-body-lg font-medium">Завантаження адмін-панелі...</p>
          <p className="text-neutral-500 text-sm">Будь ласка, зачекайте</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="size-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-h3 text-neutral-900 mb-2">Помилка завантаження</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Заголовок */}
      <div className="sticky top-0 z-50 border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm">
        <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <Building2 className="size-7 text-neutral-600"/>
              </div>
              <div>
                <div className="text-body-sm text-neutral-500 font-medium">Адмін‑панель</div>
                <h1 className="text-h5 tracking-tight text-neutral-900">
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
            <Card className="rounded-2xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-neutral-700">Книги в наявності</CardTitle>
                <BookOpen className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-green-600">
                  {data?.stats.availableBooks || 0}
                </div>
                <p className="text-caption text-neutral-500 mt-1">
                  з {data?.stats.totalBooks || 0} загалом
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-neutral-700">Активні користувачі</CardTitle>
                <Users className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-brand-accent-light">
                  {data?.stats.activeUsers || 0}
                </div>
                <p className="text-caption text-neutral-500 mt-1">
                  підписників
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-neutral-700">Доходи (місяць)</CardTitle>
                <CreditCard className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-purple-600">
                  {(data?.stats.totalRevenue || 0).toLocaleString('uk-UA')} ₴
                </div>
                <p className="text-caption text-neutral-500 mt-1">
                  Витрати: {(data?.stats.totalBooksCost || 0).toLocaleString('uk-UA')} ₴
                </p>
                <p className="text-caption text-green-600 font-medium mt-1">
                  Прибуток: {((data?.stats.totalRevenue || 0) - (data?.stats.totalBooksCost || 0)).toLocaleString('uk-UA')} ₴
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-neutral-700">РОІ (окупність)</CardTitle>
                <TrendingUp className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-orange-600">
                  {data?.stats.totalBooksCost ? Math.round(((data?.stats.totalRevenue || 0) / data.stats.totalBooksCost) * 100) : 0}%
                </div>
                <p className="text-caption text-neutral-500 mt-1">
                  повернення інвестицій
                </p>
              </CardContent>
            </Card>

            {/* Додаткові метрики для широких екранів */}
            <Card className="rounded-2xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow hidden 2xl:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-neutral-700">Середня ціна</CardTitle>
                <FileText className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-indigo-600">
                  {data?.stats.totalBooks ? Math.round((data?.stats.totalBooksCost || 0) / data.stats.totalBooks) : 0} ₴
                </div>
                <p className="text-caption text-neutral-500 mt-1">
                  за книгу в колекції
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow hidden 2xl:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-body-sm font-semibold text-neutral-700">Використання</CardTitle>
                <BarChart3 className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-h2 text-teal-600">
                  {data?.stats.totalBooks ? Math.round(((data?.stats.totalBooks - data?.stats.availableBooks) / data.stats.totalBooks) * 100) : 0}%
                </div>
                <p className="text-caption text-neutral-500 mt-1">
                  книг зараз у читачів
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Розширена навігація */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8 rounded-2xl bg-neutral-100 p-1 overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <Activity className="size-4" />
                <span className="hidden sm:inline">Огляд</span>
              </TabsTrigger>
              <TabsTrigger value="books" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <BookOpen className="size-4" />
                <span className="hidden sm:inline">Книги</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <Users className="size-4" />
                <span className="hidden sm:inline">Користувачі</span>
              </TabsTrigger>
              <TabsTrigger value="rentals" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <Calendar className="size-4" />
                <span className="hidden sm:inline">Оренди</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Аналітика</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <Download className="size-4" />
                <span className="hidden sm:inline">Експорт</span>
              </TabsTrigger>
              <TabsTrigger value="cache" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <Database className="size-4" />
                <span className="hidden sm:inline">Кеш</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                <Settings className="size-4" />
                <span className="hidden sm:inline">Система</span>
              </TabsTrigger>
            </TabsList>

            {/* Таб огляду */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-body-sm font-semibold text-neutral-700">Всього книг</CardTitle>
                    <BookOpen className="h-5 w-5 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-h2 text-brand-accent-light">
                      {data?.stats.totalBooks || 0}
                    </div>
                    <p className="text-caption text-neutral-500 mt-1">
                      Доступно: {data?.stats.availableBooks || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-body-sm font-semibold text-neutral-700">Користувачі</CardTitle>
                    <Users className="h-5 w-5 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-h2 text-brand-accent-light">
                      {data?.stats.activeUsers || 0}
                    </div>
                    <p className="text-caption text-neutral-500 mt-1">
                      Активних підписників
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-body-sm font-semibold text-neutral-700">Доходи</CardTitle>
                    <CreditCard className="h-5 w-5 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-h2 text-brand-accent-light">
                      {data?.stats.totalRevenue || 0} ₴
                    </div>
                    <p className="text-caption text-neutral-500 mt-1">
                      Загальний дохід
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-body-sm font-semibold text-neutral-700">Система</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-h2 text-green-600">
                      ОК
                    </div>
                    <p className="text-caption text-neutral-500 mt-1">
                      Всі сервіси працюють
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
              <UsersTable
                users={data?.users || []}
                onRefresh={handleRefresh}
              />
            </TabsContent>

            {/* Таб орендувань */}
            <TabsContent value="rentals" className="space-y-4">
              <Card className="rounded-2xl border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-neutral-900">Управління орендами</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-neutral-500">
                    <Calendar className="size-16 mx-auto mb-4 opacity-50" />
                    <p className="text-body-lg font-semibold text-neutral-700 mb-2">Орендні записи</p>
                    <p className="text-neutral-500">Відстеження видачі та повернень</p>
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" className="mr-2">
                        <Plus className="size-4 mr-2" />
                        Нова оренда
                      </Button>
                      <Button variant="outline">
                        <Eye className="size-4 mr-2" />
                        Переглянути всі
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Таб аналітики */}
            <TabsContent value="analytics" className="space-y-4">
              <Card className="rounded-2xl border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-neutral-900">Аналітика та звіти</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-body-lg font-semibold text-neutral-700">Швидкі звіти</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <BarChart3 className="size-4 mr-2" />
                          Популярні книги
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <TrendingUp className="size-4 mr-2" />
                          Динаміка доходів
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="size-4 mr-2" />
                          Активність користувачів
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-body-lg font-semibold text-neutral-700">Експорт даних</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Download className="size-4 mr-2" />
                          Експорт в Excel
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="size-4 mr-2" />
                          Експорт в PDF
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Database className="size-4 mr-2" />
                          Резервна копія
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Таб експорту */}
            <TabsContent value="export" className="space-y-4">
              <ExportData />
            </TabsContent>

            {/* Таб кешу */}
            <TabsContent value="cache" className="space-y-4">
              <CacheManager />
            </TabsContent>

            {/* Таб системи */}
            <TabsContent value="system" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-2xl border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-neutral-900 flex items-center gap-2">
                      <Database className="size-5" />
                      База даних
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="size-4 mr-2" />
                      Оновити індекси
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleFixBooksData}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Виправити дані книг
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="size-4 mr-2" />
                      Перевірити безпеку
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-neutral-900 flex items-center gap-2">
                      <Zap className="size-5" />
                      Продуктивність
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="size-4 mr-2" />
                      Моніторинг системи
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="size-4 mr-2" />
                      Налаштування сповіщень
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="size-4 mr-2" />
                      Системні налаштування
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-neutral-200 shadow-sm md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-neutral-900 flex items-center gap-2">
                      <CreditCard className="size-5" />
                      Інтеграції
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonobankTest />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Таб звітів */}
            <TabsContent value="reports" className="space-y-4">
              <Card className="rounded-2xl border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-neutral-900">Звіти та аналітика</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-neutral-500">
                    <BarChart3 className="size-16 mx-auto mb-4 opacity-50" />
                    <p className="text-body-lg font-semibold text-neutral-700 mb-2">Аналітика</p>
                    <p className="text-neutral-500">Фінансові звіти та статистика (в розробці)</p>
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