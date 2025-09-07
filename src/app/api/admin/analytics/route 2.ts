import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    // Визначаємо дати на основі діапазону
    const now = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Завантажуємо дані з різних таблиць
    const [usersRes, booksRes, rentalsRes, paymentsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('books').select('*'),
      supabase.from('rentals').select('*'),
      supabase.from('payments').select('*')
    ])

    if (usersRes.error) throw usersRes.error
    if (booksRes.error) throw booksRes.error
    if (rentalsRes.error) throw rentalsRes.error
    if (paymentsRes.error) throw paymentsRes.error

    const users = usersRes.data || []
    const books = booksRes.data || []
    const rentals = rentalsRes.data || []
    const payments = paymentsRes.data || []

    // Розрахунок основних метрик
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.status === 'active').length
    const totalBooks = books.length
    const availableBooks = books.filter(b => b.available).length
    const totalRentals = rentals.length
    const activeRentals = rentals.filter(r => r.status === 'active').length
    const overdueRentals = rentals.filter(r => r.status === 'overdue').length

    // Розрахунок доходів
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const monthlyRevenue = payments
      .filter(p => {
        if (!p.created_at) return false
        const paymentDate = new Date(p.created_at)
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    
    const weeklyRevenue = payments
      .filter(p => {
        if (!p.created_at) return false
        const paymentDate = new Date(p.created_at)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return paymentDate >= weekAgo
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    // Розрахунок середньої тривалості оренди
    const completedRentals = rentals.filter(r => r.status === 'completed' && r.return_date)
    const averageRentalDuration = completedRentals.length > 0 
      ? completedRentals.reduce((sum, r) => {
          if (!r.created_at || !r.return_date) return sum
          const start = new Date(r.created_at)
          const end = new Date(r.return_date)
          return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / completedRentals.length
      : 0

    // Розрахунок показників використання
    const userRetentionRate = totalUsers > 0 ? activeUsers / totalUsers : 0
    const bookUtilizationRate = totalBooks > 0 ? (totalBooks - availableBooks) / totalBooks : 0

    // Популярні книги
    const bookRentalCounts = rentals.reduce((acc, rental) => {
      const bookId = rental.book_id
      acc[bookId] = (acc[bookId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const popularBooks = books
      .map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        code: book.code,
        rental_count: bookRentalCounts[book.id] || 0,
        revenue: (bookRentalCounts[book.id] || 0) * (book.price_uah || 0),
        rating: Math.random() * 5 // Поки що випадковий рейтинг
      }))
      .sort((a, b) => b.rental_count - a.rental_count)
      .slice(0, 10)

    // Топ користувачі
    const userRentalCounts = rentals.reduce((acc, rental) => {
      const userId = rental.user_id
      acc[userId] = (acc[userId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const userSpending = payments.reduce((acc, payment) => {
      const userId = payment.user_id
      if (userId) {
        acc[userId] = (acc[userId] || 0) + (payment.amount || 0)
      }
      return acc
    }, {} as Record<string, number>)

    const topUsers = users
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        total_rentals: userRentalCounts[user.id] || 0,
        total_spent: userSpending[user.id] || 0,
        last_activity: user.created_at
      }))
      .sort((a, b) => b.total_rentals - a.total_rentals)
      .slice(0, 10)

    // Остання активність
    const recentActivity = [
      ...rentals.map(rental => ({
        id: `rental-${rental.id}`,
        type: 'rental' as const,
        user_name: users.find(u => u.id === rental.user_id)?.name || 'Невідомий',
        book_title: books.find(b => b.id === rental.book_id)?.title,
        amount: books.find(b => b.id === rental.book_id)?.price_uah || 0,
        timestamp: rental.created_at
      })),
      ...payments.map(payment => ({
        id: `payment-${payment.id}`,
        type: 'payment' as const,
        user_name: users.find(u => u.id === payment.user_id)?.name || 'Невідомий',
        amount: payment.amount || 0,
        timestamp: payment.created_at
      }))
    ]
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 20)

    // Тренди (спрощена версія)
    const trends = {
      userGrowth: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
        const dayUsers = users.filter(u => 
          u.created_at && new Date(u.created_at).toDateString() === date.toDateString()
        ).length
        return {
          date: date.toISOString().split('T')[0],
          count: dayUsers
        }
      }),
      revenueGrowth: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
        const dayRevenue = payments
          .filter(p => p.created_at && new Date(p.created_at).toDateString() === date.toDateString())
          .reduce((sum, p) => sum + (p.amount || 0), 0)
        return {
          date: date.toISOString().split('T')[0],
          amount: dayRevenue
        }
      }),
      rentalActivity: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
        const dayRentals = rentals.filter(r => 
          r.created_at && new Date(r.created_at).toDateString() === date.toDateString()
        ).length
        return {
          date: date.toISOString().split('T')[0],
          count: dayRentals
        }
      })
    }

    // Продуктивність системи (мокові дані)
    const performance = {
      averageResponseTime: 150 + Math.random() * 100,
      systemUptime: 0.99 + Math.random() * 0.01,
      errorRate: Math.random() * 0.02,
      cacheHitRate: 0.85 + Math.random() * 0.1
    }

    const analyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        totalBooks,
        availableBooks,
        totalRentals,
        activeRentals,
        overdueRentals,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        averageRentalDuration,
        userRetentionRate,
        bookUtilizationRate
      },
      trends,
      popularBooks,
      topUsers,
      recentActivity,
      performance
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Помилка завантаження аналітики',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    )
  }
}