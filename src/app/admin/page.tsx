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
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('supabase.auth.token');
      const token = authToken ? JSON.parse(authToken).access_token : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Load data from API instead of server actions
      const [booksResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/books', { headers }),
        fetch('/api/admin/users', { headers })
      ])
      
      if (!booksResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to load data')
      }
      
      const booksData = await booksResponse.json()
      const usersData = await usersResponse.json()
      
      setBooks(booksData.data?.books || booksData.data || [])
      setUsers(usersData.data?.users || usersData.data || [])
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm">
          <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            <div className="flex items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Завантаження адмін-панелі...</span>
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