import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    
    const { email, password } = validatedData;
    
    // Аутентификация через Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.error('Login failed', { error }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неправильний email або пароль' 
        },
        { status: 401 }
      );
    }

    logger.info('User logged in successfully', { userId: data.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    });

  } catch (error: any) {
    logger.error('Login API error', error, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
