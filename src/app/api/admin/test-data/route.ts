import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(): Promise<Response> {
  try {
    // Создаем 3 тестовых пользователя
    const userData = [
      {
        name: 'Анна Петренко',
        email: 'anna.petrenko@example.com',
        phone: '+380501234567',
        subscription_type: 'premium' as const,
        subscription_start: '2024-06-01', // 6 месяцев назад
        subscription_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // истекает через 7 дней
        status: 'active' as const,
        address: 'вул. Соборна 15, кв. 42, Миколаїв',
        notes: 'Постійний клієнт, любить дитячі книги'
      },
      {
        name: 'Олексій Коваленко',
        email: 'oleksiy.kovalenko@example.com',
        phone: '+380671234567',
        subscription_type: 'maxi' as const,
        subscription_start: '2024-11-01', // 1 месяц назад
        subscription_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // истекает через 3 дня
        status: 'active' as const,
        address: 'вул. Адміральська 8, кв. 12, Миколаїв',
        notes: 'Зацікавлений в науковій літературі'
      },
      {
        name: 'Марія Сидоренко',
        email: 'maria.sydorenko@example.com',
        phone: '+380931234567',
        subscription_type: 'mini' as const,
        subscription_start: '2024-10-01', // 2 месяца назад
        subscription_end: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // просрочена на 7 дней
        status: 'active' as const,
        address: 'вул. Центральна 25, кв. 7, Миколаїв',
        notes: 'Новий клієнт, тестує сервіс'
      }
    ]

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(userData as any)
      .select()

    if (usersError) {
      console.error('Error creating users:', usersError)
      return NextResponse.json({ error: 'Failed to create users' }, { status: 500 })
    }

    // Получаем ID созданных пользователей
    const userIds = (users as any)?.map((user: any) => user.id) || []

    // Получаем доступные книги
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, code')
      .eq('available', true)
      .limit(5)

    if (booksError) {
      console.error('Error fetching books:', booksError)
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }

    const bookIds = (books as any)?.map((book: any) => book.id) || []

    if (bookIds.length === 0) {
      return NextResponse.json({ error: 'No available books found' }, { status: 400 })
    }

    // Создаем 3 тестовые аренды
    const rentalData = []
    for (let i = 0; i < 3; i++) {
      const userId = userIds[i % userIds.length]
      const bookId = bookIds[i % bookIds.length]
      
      rentalData.push({
        user_id: userId,
        book_id: bookId,
        rental_date: new Date(Date.now() - (i + 1) * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5, 10, 15 дней назад
        due_date: new Date(Date.now() + (30 - (i + 1) * 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // через 25, 20, 15 дней
        status: 'active' as const,
        notes: `Тестова аренда ${i + 1} для перевірки адмін панелі`
      })
    }

    const { data: createdRentals, error: rentalsError } = await supabase
      .from('rentals')
      .insert(rentalData as any)
      .select()

    if (rentalsError) {
      console.error('Error creating rentals:', rentalsError)
      return NextResponse.json({ error: 'Failed to create rentals' }, { status: 500 })
    }

    // Создаем тестовые платежи
    const paymentData = []
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i]
      const user = (users as any)?.find((u: any) => u.id === userId)
      let amount = 300 // default mini
      
      if (user?.subscription_type === 'premium') amount = 1500
      else if (user?.subscription_type === 'maxi') amount = 500

      paymentData.push({
        user_id: userId,
        amount_uah: amount,
        currency: 'UAH' as const,
        payment_method: (['monobank', 'online', 'cash'] as const)[i % 3],
        status: 'completed' as const,
        transaction_id: `TXN_${Date.now()}_${i}`,
        payment_date: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3, 6, 9 дней назад
        description: `Оплата підписки ${(user as any)?.subscription_type} на 3 місяці`
      })
    }

    const { data: createdPayments, error: paymentsError } = await supabase
      .from('payments')
      .insert(paymentData as any)
      .select()

    if (paymentsError) {
      console.error('Error creating payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to create payments' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        users: users?.length || 0,
        rentals: createdRentals?.length || 0,
        payments: createdPayments?.length || 0
      }
    })

  } catch (error) {
    console.error('Error in test data creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
