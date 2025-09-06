import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
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

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

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

    // Статистика за сьогодні
    const booksAddedToday = books.filter(b => {
      if (!b.created_at) return false
      const bookDate = new Date(b.created_at)
      return bookDate >= today
    }).length

    const usersRegisteredToday = users.filter(u => {
      if (!u.created_at) return false
      const userDate = new Date(u.created_at)
      return userDate >= today
    }).length

    const rentalsToday = rentals.filter(r => {
      if (!r.created_at) return false
      const rentalDate = new Date(r.created_at)
      return rentalDate >= today
    }).length

    const revenueToday = payments
      .filter(p => {
        if (!p.created_at) return false
        const paymentDate = new Date(p.created_at)
        return paymentDate >= today
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)

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
      })),
      ...users.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registration' as const,
        user_name: user.name,
        timestamp: user.created_at
      }))
    ]
    .sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 10)

    // Сповіщення та попередження
    const alerts = []

    // Перевіряємо просрочені оренди
    if (overdueRentals > 0) {
      alerts.push({
        id: 'overdue-rentals',
        type: 'warning' as const,
        title: 'Просрочені оренди',
        message: `У вас є ${overdueRentals} просрочених оренд, які потребують уваги`,
        timestamp: now.toISOString()
      })
    }

    // Перевіряємо низьку кількість доступних книг
    const lowStockBooks = books.filter(b => (b.qty_available ?? 0) <= 1).length
    if (lowStockBooks > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'info' as const,
        title: 'Низький запас книг',
        message: `${lowStockBooks} книг мають низький запас (1 або менше)`,
        timestamp: now.toISOString()
      })
    }

    // Перевіряємо нових користувачів
    if (usersRegisteredToday > 0) {
      alerts.push({
        id: 'new-users',
        type: 'success' as const,
        title: 'Нові користувачі',
        message: `Сьогодні зареєструвалось ${usersRegisteredToday} нових користувачів`,
        timestamp: now.toISOString()
      })
    }

    // Перевіряємо високі доходи
    if (revenueToday > 1000) {
      alerts.push({
        id: 'high-revenue',
        type: 'success' as const,
        title: 'Високі доходи',
        message: `Сьогодні отримано ${revenueToday.toLocaleString('uk-UA')} ₴`,
        timestamp: now.toISOString()
      })
    }

    const dashboardData = {
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
        weeklyRevenue
      },
      recentActivity,
      alerts,
      quickStats: {
        booksAddedToday,
        usersRegisteredToday,
        rentalsToday,
        revenueToday
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Помилка завантаження дашборду',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    )
  }
}
