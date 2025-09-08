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

export async function POST(request: NextRequest): Promise<Response> {
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

    // Получение профиля пользователя по email (более простой способ)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authData.user.email)
      .single();

    if (profileError) {
      logger.error('Failed to fetch user profile', { error: profileError }, 'Auth');
      // Создаем базовый профиль если не найден
      const { data: newProfile } = await supabase
        .from('users')
        .insert({
          email: authData.user.email,
          name: authData.user.user_metadata?.full_name || authData.user.email,
          role: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua') ? 'admin' : 'user',
          subscription: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua') ? 'premium' : 'free',
          status: 'active'
        })
        .select('*')
        .single();
      
      return NextResponse.json({
        success: true,
        message: 'Успішний вхід (створено новий профіль)',
        user: authData.user,
        profile: newProfile || null,
        session: authData.session
      });
    }

    logger.info('User logged in successfully', { userId: authData.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Успішний вхід',
      user: authData.user,
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
