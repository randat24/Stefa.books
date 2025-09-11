import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ============================================================================
// ПРОСТОЙ API ДЛЯ ВХОДА - РАБОТАЕТ ТОЛЬКО С USER_PROFILES
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

    logger.info('Simple login attempt', { email: validatedData.email }, 'Auth');

    // Попытка входа
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    });

    if (authError) {
      logger.error('Simple login failed', { error: authError.message }, 'Auth');
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

    // Получаем профиль из user_profiles
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    let profile = null;
    
    if (profileData) {
      // Конвертируем user_profiles в формат users
      profile = {
        id: authData.user.id,
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || authData.user.email,
        email: profileData.email,
        phone: profileData.phone || null,
        role: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua') ? 'admin' : 'user',
        subscription_type: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua') ? 'premium' : 'mini',
        status: 'active',
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };
    } else {
      // Создаем базовый профиль
      profile = {
        id: authData.user.id,
        name: authData.user.user_metadata?.full_name || authData.user.email,
        email: authData.user.email,
        phone: null,
        role: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua') ? 'admin' : 'user',
        subscription_type: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua') ? 'premium' : 'mini',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    logger.info('Simple login successful', { userId: authData.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Успішний вхід',
      user: authData.user,
      profile: profile,
      session: authData.session
    });

  } catch (error: any) {
    logger.error('Simple login API error', error, 'Auth');
    
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
