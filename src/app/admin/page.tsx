"use client"

import { useState, useEffect } from "react"
import { RefreshCw, BookOpen, Users, Calendar, BarChart3, FileText, Database, CreditCard, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/Badge"
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { UsersTable } from "@/app/admin/components/UsersTable"
import { BooksTable } from "./components/BooksTable"
import ExportData from "@/components/admin/ExportData"
import CacheManager from "@/components/admin/CacheManager"
import MonobankTest from "@/components/admin/MonobankTest"
import type { BookRow, UserRow } from "@/lib/types/admin"

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
  const [, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'users' | 'rentals' | 'analytics' | 'export' | 'cache' | 'monobank'>('overview')

  // ============================================================================
  // ЗАВАНТАЖЕННЯ ДАНИХ
  // ============================================================================

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load data from API without authentication
      const [booksResponse, usersResponse] = await Promise.allSettled([
        fetch('/api/admin/books'),
        fetch('/api/admin/users')
      ])
      
      // Обрабатываем ответы книг
      if (booksResponse.status === 'fulfilled' && booksResponse.value.ok) {
        const booksData = await booksResponse.value.json()
        setBooks(booksData.data?.books || booksData.data || [])
      } else {
        console.error('Failed to load books:', booksResponse.status === 'rejected' ? booksResponse.reason : 'HTTP error')
        setBooks([])
      }
      
      // Обрабатываем ответы пользователей
      if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
        const usersData = await usersResponse.value.json()
        setUsers(usersData.data?.users || usersData.data || [])
      } else {
        console.error('Failed to load users:', usersResponse.status === 'rejected' ? usersResponse.reason : 'HTTP error')
        setUsers([])
      }
      
      // Проверяем, что хотя бы один API сработал
      if (booksResponse.status === 'rejected' && usersResponse.status === 'rejected') {
        throw new Error('Failed to load data from both APIs')
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Помилка завантаження даних')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadData()
    } catch (err) {
      console.error('Error refreshing data:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleBookCreated = () => {
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  // ============================================================================
  // КЕШУВАННЯ
  // ============================================================================

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY)
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData)
        if (Date.now() - timestamp < CACHE_DURATION && data) {
          setBooks(data.books || [])
          setUsers(data.users || [])
          setLoading(false)
        }
      } catch (err) {
        console.error('Error parsing cached data:', err)
      }
    }
  }, [])

  useEffect(() => {
    if (books.length > 0 || users.length > 0) {
      const cacheData = {
        books,
        users,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    }
  }, [books, users])

  // ============================================================================
  // РЕНДЕР
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-surface to-white">
        <div className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur-sm">
          <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            <div className="flex items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-text-muted" />
              <span className="ml-2 text-text-muted">Завантаження адмін-панелі...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-surface to-white">
        <div className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur-sm">
          <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            <div className="text-center">
              <p className="text-error mb-4">{error}</p>
              <Button onClick={loadData} variant="outline">
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
    <div className="min-h-screen bg-gradient-to-b from-surface to-white">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur-sm">
        <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-surface flex items-center justify-center">
                  <FileText className="size-4 text-text-muted" />
                </div>
                <div>
                  <div className="text-body-sm text-text-muted font-medium">Адмін‑панель</div>
                  <h1 className="text-h1 tracking-tight text-text">
                    Stefa.books — Управління
                  </h1>
                </div>
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
                className="hidden sm:flex"
              >
                <RefreshCw className="size-4 mr-2" />
                Оновити
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
        {/* Навигация по табам */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 rounded-2xl bg-surface p-1">
            <TabsTrigger value="overview" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Огляд</span>
            </TabsTrigger>
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
            <TabsTrigger value="analytics" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Аналітика</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="size-4" />
              <span className="hidden sm:inline">Експорт</span>
            </TabsTrigger>
            <TabsTrigger value="cache" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Database className="size-4" />
              <span className="hidden sm:inline">Кеш</span>
            </TabsTrigger>
            <TabsTrigger value="monobank" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="size-4" />
              <span className="hidden sm:inline">Monobank</span>
            </TabsTrigger>
          </TabsList>

          {/* Таб огляду */}
          <TabsContent value="overview" className="space-y-4">
            <AdminDashboard 
              books={books}
              users={users}
              onRefresh={handleRefresh}
              onBookCreated={handleBookCreated}
            />
          </TabsContent>

          {/* Таб книг */}
          <TabsContent value="books" className="space-y-4">
            <BooksTable
              books={books}
              onRefresh={handleRefresh}
              onBookCreated={handleBookCreated}
            />
          </TabsContent>

          {/* Таб користувачів */}
          <TabsContent value="users" className="space-y-4">
            <UsersTable users={users} onRefresh={handleRefresh} />
          </TabsContent>

          {/* Таб оренд */}
          <TabsContent value="rentals" className="space-y-4">
            <Card className="rounded-2xl border-line shadow-sm">
              <CardHeader>
                <CardTitle className="text-text">Управління орендами</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-text-muted">
                  <Calendar className="size-16 mx-auto mb-4 opacity-50" />
                  <p className="text-body-lg font-semibold text-text mb-2">Орендні записи</p>
                  <p className="text-text-muted">Відстеження видачі та повернень (в розробці)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Таб аналітики */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="rounded-2xl border-line shadow-sm">
              <CardHeader>
                <CardTitle className="text-text">Звіти та аналітика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-text-muted">
                  <BarChart3 className="size-16 mx-auto mb-4 opacity-50" />
                  <p className="text-body-lg font-semibold text-text mb-2">Аналітика</p>
                  <p className="text-text-muted">Фінансові звіти та статистика (в розробці)</p>
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

          {/* Таб Monobank */}
          <TabsContent value="monobank" className="space-y-4">
            <MonobankTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}