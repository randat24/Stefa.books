import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
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
    
    const { email, password } = validatedData;
    
    const supabase = await createSupabaseServerClient();
    // Простая аутентификация через Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.error('Simple login failed', { error }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неправильний email або пароль' 
        },
        { status: 401 }
      );
    }

    // Получаем профиль пользователя из user_profiles
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    logger.info('Simple login successful', { userId: data.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      user: data.user,
      profile: profileData,
      session: data.session
    });

  } catch (error: any) {
    logger.error('Simple login API error', error, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
