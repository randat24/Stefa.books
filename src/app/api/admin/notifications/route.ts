import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(): Promise<Response> {
  try {
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    // const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) // Will be used for future features

    // Получаем пользователей с подписками, которые истекают в течение 7 дней
    const { data: expiringUsers, error: expiringError } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'active')
      .gte('subscription_end', today.toISOString().split('T')[0])
      .lte('subscription_end', sevenDaysFromNow.toISOString().split('T')[0])

    if (expiringError) {
      console.error('Error fetching expiring users:', expiringError)
      return NextResponse.json({ error: 'Failed to fetch expiring users' }, { status: 500 })
    }

    // Получаем пользователей с просроченными подписками (более 7 дней назад)
    const { data: overdueUsers, error: overdueError } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'active')
      .lt('subscription_end', today.toISOString().split('T')[0])

    if (overdueError) {
      console.error('Error fetching overdue users:', overdueError)
      return NextResponse.json({ error: 'Failed to fetch overdue users' }, { status: 500 })
    }

    // Получаем просроченные аренды
    const { data: overdueRentals, error: overdueRentalsError } = await supabase
      .from('rentals')
      .select(`
        *,
        users:user_id (name, email, phone),
        books:book_id (title, code)
      `)
      .eq('status', 'overdue')
      .lt('due_date', today.toISOString().split('T')[0])

    if (overdueRentalsError) {
      console.error('Error fetching overdue rentals:', overdueRentalsError)
      return NextResponse.json({ error: 'Failed to fetch overdue rentals' }, { status: 500 })
    }

    // Формируем уведомления
    const notifications: any[] = []

    // Уведомления об истекающих подписках
    expiringUsers?.forEach((user: any) => {
      const daysLeft = Math.ceil((new Date(user.subscription_end).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `expiring_${user.id}`,
        type: 'subscription_expiring',
        priority: daysLeft <= 3 ? 'high' : 'medium',
        title: 'Підписка закінчується',
        message: `Підписка ${user.name} (${user.subscription_type}) закінчується через ${daysLeft} дн.`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          subscription_type: user.subscription_type,
          subscription_end: user.subscription_end
        },
        daysLeft,
        createdAt: new Date().toISOString()
      })
    })

    // Уведомления о просроченных подписках
    overdueUsers?.forEach((user: any) => {
      const daysOverdue = Math.ceil((today.getTime() - new Date(user.subscription_end).getTime()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `overdue_${user.id}`,
        type: 'subscription_overdue',
        priority: 'high',
        title: 'Підписка прострочена',
        message: `Підписка ${user.name} (${user.subscription_type}) прострочена на ${daysOverdue} дн.`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          subscription_type: user.subscription_type,
          subscription_end: user.subscription_end
        },
        daysOverdue,
        createdAt: new Date().toISOString()
      })
    })

    // Уведомления о просроченных арендах
    overdueRentals?.forEach((rental: any) => {
      const daysOverdue = Math.ceil((today.getTime() - new Date(rental.due_date).getTime()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `rental_overdue_${rental.id}`,
        type: 'rental_overdue',
        priority: daysOverdue > 14 ? 'high' : 'medium',
        title: 'Оренда прострочена',
        message: `${rental.users?.name} не повернув книгу "${rental.books?.title}" (${daysOverdue} дн. прострочки)`,
        rental: {
          id: rental.id,
          user_name: rental.users?.name,
          user_email: rental.users?.email,
          user_phone: rental.users?.phone,
          book_title: rental.books?.title,
          book_code: rental.books?.code,
          due_date: rental.due_date
        },
        daysOverdue,
        createdAt: new Date().toISOString()
      })
    })

    // Сортируем по приоритету и дате
    notifications.sort((a: any, b: any) => {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        summary: {
          total: notifications.length,
          expiring_subscriptions: expiringUsers?.length || 0,
          overdue_subscriptions: overdueUsers?.length || 0,
          overdue_rentals: overdueRentals?.length || 0,
          high_priority: notifications.filter(n => n.priority === 'high').length,
          medium_priority: notifications.filter(n => n.priority === 'medium').length
        }
      }
    })

  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
