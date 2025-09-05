"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { Building2, BookOpen, Users, CreditCard, TrendingUp, RefreshCw, CheckCircle, FileText, BarChart3, Cloud, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { getBooks, getUsers } from "./data"
import type { BookRow, UserRow } from "@/lib/types/admin"

// Ленивая загрузка тяжелых компонентов
const BooksTable = lazy(() => import("./components/BooksTable").then(module => ({ default: module.BooksTable })))
const SyncPanel = lazy(() => import("./components/SyncPanel").then(module => ({ default: module.SyncPanel })))
const UsersTable = lazy(() => import("./components/UsersTable").then(module => ({ default: module.UsersTable })))
const RentalsTable = lazy(() => import("./components/RentalsTable").then(module => ({ default: module.RentalsTable })))
const AnalyticsDashboard = lazy(() => import("./components/AnalyticsDashboard").then(module => ({ default: module.AnalyticsDashboard })))
const NotificationsPanel = lazy(() => import("./components/NotificationsPanel").then(module => ({ default: module.NotificationsPanel })))

// ============================================================================
// АДМІН-ПАНЕЛЬ STEFA.BOOKS
// ============================================================================

const CACHE_KEY = 'stefa-admin-books'
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export default function AdminPage() {
  const [books, setBooks] = useState<BookRow[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Загрузка из кэша
  function loadFromCache(): BookRow[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      
      const { data, timestamp } = JSON.parse(cached)
      const isExpired = Date.now() - timestamp > CACHE_DURATION
      
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }
      
      return data
    } catch {
      return null
    }
  }

  // Сохранение в кэш
  function saveToCache(data: BookRow[]) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch {
      // Игнорируем ошибки кэширования
    }
  }

  // ============================================================================
  // ЗАВАНТАЖЕННЯ ДАНИХ
  // ============================================================================

  async function loadData(forceRefresh = false) {
    try {
      setError(null)
      
      // Пробуем загрузить из кэша сначала
      if (!forceRefresh) {
        const cachedData = loadFromCache()
        if (cachedData) {
          setBooks(cachedData)
          setLoading(false)
          return // Данные загружены из кэша, выходим
        }
      }
      
      setLoading(true)
      const [booksData, usersData] = await Promise.all([
        getBooks(),
        getUsers()
      ])
      setBooks(booksData)
      setUsers(usersData)
      saveToCache(booksData) // Сохраняем в кэш
      
    } catch (err) {
      console.error('Admin page error:', err)
      setError('Помилка завантаження даних. Спробуйте перезавантажити сторінку.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true)
      await loadData(true) // Принудительно обновляем, игнорируя кэш
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // ОБРОБНИКИ ПОДІЙ
  // ============================================================================

  function handleBookCreated() {
    loadData()
  }

  // ============================================================================
  // СТАТИСТИКА
  // ============================================================================
  
  const stats = {
    totalBooks: books.length,
    availableBooks: books.filter(book => book.available).length,
    activeUsers: users.filter(user => user.status === 'active').length,
    totalRevenue: 0, // Пока 0, добавим позже
    totalBooksCost: books.reduce((sum, book) => sum + (book.price_uah || 0), 0)
  }

  // ============================================================================
  // РЕНДЕР СТОРІНКИ
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">Завантаження адмін-панелі...</p>
          <p className="text-gray-500 text-sm">Будь ласка, зачекайте</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <FileText className="size-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Помилка завантаження</h2>
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
      <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm">
        <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Building2 className="size-7 text-gray-600"/>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Адмін‑панель</div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
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
          
          {/* Панель уведомлений */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Завантаження сповіщень...</span>
            </div>
          }>
            <NotificationsPanel onRefresh={handleRefresh} />
          </Suspense>

          {/* KPI метрики */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Книги в наявності</CardTitle>
                <BookOpen className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.availableBooks}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  з {stats.totalBooks} загалом
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Активні користувачі</CardTitle>
                <Users className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-accent-light">
                  {stats.activeUsers}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  підписників
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Доходи (місяць)</CardTitle>
                <CreditCard className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalRevenue.toLocaleString('uk-UA')} ₴
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Витрати: {stats.totalBooksCost.toLocaleString('uk-UA')} ₴
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  Прибуток: {(stats.totalRevenue - stats.totalBooksCost).toLocaleString('uk-UA')} ₴
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">РОІ (окупність)</CardTitle>
                <TrendingUp className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.totalBooksCost ? Math.round((stats.totalRevenue / stats.totalBooksCost) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  повернення інвестицій
                </p>
              </CardContent>
            </Card>

            {/* Додаткові метрики для широких екранів */}
            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow hidden 2xl:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Середня ціна</CardTitle>
                <FileText className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {stats.totalBooks ? Math.round(stats.totalBooksCost / stats.totalBooks) : 0} ₴
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  за книгу в колекції
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow hidden 2xl:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Використання</CardTitle>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {stats.totalBooks ? Math.round(((stats.totalBooks - stats.availableBooks) / stats.totalBooks) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  книг зараз у читачів
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Головні таби */}
          <Tabs defaultValue="books" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-gray-100 p-1">
              <TabsTrigger value="books" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BookOpen className="size-4" />
                <span className="hidden sm:inline">Книги</span>
              </TabsTrigger>
              <TabsTrigger value="sync" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Cloud className="size-4" />
                <span className="hidden sm:inline">Синхронізація</span>
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
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Завантаження таблиці книг...</span>
                </div>
              }>
                <BooksTable
                  books={books}
                  onRefresh={handleRefresh}
                  onBookCreated={handleBookCreated}
                />
              </Suspense>
            </TabsContent>

            {/* Таб синхронізації */}
            <TabsContent value="sync" className="space-y-4">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Завантаження панелі синхронізації...</span>
                </div>
              }>
                <SyncPanel />
              </Suspense>
            </TabsContent>

            {/* Таб користувачів */}
            <TabsContent value="users" className="space-y-4">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Завантаження користувачів...</span>
                </div>
              }>
                <UsersTable onRefresh={handleRefresh} />
              </Suspense>
            </TabsContent>

            {/* Таб орендувань */}
            <TabsContent value="rentals" className="space-y-4">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Завантаження оренд...</span>
                </div>
              }>
                <RentalsTable onRefresh={handleRefresh} />
              </Suspense>
            </TabsContent>

            {/* Таб звітів */}
            <TabsContent value="reports" className="space-y-4">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Завантаження аналітики...</span>
                </div>
              }>
                <AnalyticsDashboard onRefresh={handleRefresh} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}