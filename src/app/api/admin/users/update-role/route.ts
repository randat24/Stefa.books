import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateRoleSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'admin', 'moderator'], {
    errorMap: () => ({ message: 'Role must be user, admin, or moderator' })
  })
})

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const { email, role } = updateRoleSchema.parse(body)

    logger.info('Admin API: Updating user role', { email, role })

    // Update user role in user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      logger.error('Admin API: Database error when updating user role', error)
      return NextResponse.json(
        { error: 'Ошибка при обновлении роли пользователя' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      logger.warn('Admin API: User not found', { email })
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    logger.info('Admin API: User role updated successfully', { 
      email, 
      role,
      userId: data[0].id
    })

    return NextResponse.json({
      success: true,
      message: 'Роль пользователя успешно обновлена',
      data: {
        email: data[0].email,
        role: data[0].role,
        id: data[0].id
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Admin API: Validation error in update role', error.errors)
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Admin API: Unexpected error in update role', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
