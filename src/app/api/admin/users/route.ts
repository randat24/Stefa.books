import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Загружаем пользователей из таблицы users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      logger.error('Admin API: Database error when fetching users', error)
      return NextResponse.json(
        { error: 'Ошибка при получении пользователей' },
        { status: 500 }
      )
    }

    // Обрабатываем данные для соответствия ожидаемой структуре
    const processedUsers = users?.map((user: any) => ({
      ...user,
      // Добавляем поля, которые ожидает админ панель
      subscription_type: user.subscription_type || 'mini',
      status: user.status || 'active',
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString()
    })) || []

    logger.info('Admin API: Users fetched successfully', { 
      count: processedUsers?.length || 0
    })

    return NextResponse.json({
      success: true,
      data: processedUsers,
      count: processedUsers?.length || 0
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error in GET /api/admin/users', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}