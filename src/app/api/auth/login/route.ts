import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ============================================================================
// API ДЛЯ ВХОДУ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================================

const loginSchema = z.object({
  email: z.string().email('Неправильний формат email'),
  password: z.string().min(1, 'Пароль обов\'язковий')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validatedData = loginSchema.parse(body);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    logger.info('User login attempt', { email: validatedData.email }, 'Auth');

    // Попытка входа
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    });

    if (authError) {
      logger.error('Login failed', { error: authError.message }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неправильний email або пароль' 
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      logger.error('No user data returned', {}, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Помилка аутентифікації' 
        },
        { status: 401 }
      );
    }

    // Получение профиля пользователя
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      logger.error('Failed to fetch user profile', { error: profileError }, 'Auth');
      // Не блокируем вход, если профиль не найден
    }

    logger.info('User logged in successfully', { userId: authData.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Успішний вхід',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: authData.user.user_metadata?.first_name,
        lastName: authData.user.user_metadata?.last_name,
        phone: authData.user.user_metadata?.phone
      },
      profile: profile || null,
      session: authData.session
    });

  } catch (error: any) {
    logger.error('Login API error', { error }, 'Auth');
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: error.errors[0]?.message || 'Неправильні дані' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
