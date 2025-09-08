import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(): Promise<Response> {
  try {
    // Удаляем тестовые данные в правильном порядке (сначала зависимые таблицы)
    
    // Удаляем платежи
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .like('description', '%тест%')

    if (paymentsError) {
      console.error('Error deleting payments:', paymentsError)
    }

    // Удаляем аренды
    const { error: rentalsError } = await supabase
      .from('rentals')
      .delete()
      .like('notes', '%тест%')

    if (rentalsError) {
      console.error('Error deleting rentals:', rentalsError)
    }

    // Удаляем пользователей
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .in('email', [
        'anna.petrenko@example.com',
        'oleksiy.kovalenko@example.com',
        'maria.sydorenko@example.com'
      ])

    if (usersError) {
      console.error('Error deleting users:', usersError)
      return NextResponse.json({ error: 'Failed to delete users' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test data cleared successfully'
    })

  } catch (error) {
    console.error('Error in clear test data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
