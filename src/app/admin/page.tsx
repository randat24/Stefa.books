"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import ExportData from "@/components/admin/ExportData"
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
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="sticky top-0 z-10 border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm">
          <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            <div className="flex items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-neutral-400" />
              <span className="ml-2 text-neutral-600">Завантаження адмін-панелі...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="sticky top-0 z-10 border-b border-neutral-200/60 bg-white/90 backdrop-blur-sm">
          <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
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
    <div className="space-y-6">
      <ExportData />
      <AdminDashboard 
        books={books}
        users={users}
        onRefresh={handleRefresh}
        onBookCreated={handleBookCreated}
      />
    </div>
  )
}