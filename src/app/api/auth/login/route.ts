import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

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
    
    const supabase = await createSupabaseServerClient();
    // Аутентификация через Supabase (cookies will be set automatically)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Более детальное логирование ошибок
      logger.error('Login failed', { 
        error: error.message,
        code: error.status,
        email: email // Логируем email для отладки
      }, 'Auth');
      
      // Разные сообщения для разных типов ошибок
      let errorMessage = 'Неправильний email або пароль';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Неправильний email або пароль';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Потрібно підтвердити email';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Забагато спроб входу. Спробуйте пізніше';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage 
        },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь и сессия существуют
    if (!data.user || !data.session) {
      logger.error('Login succeeded but no user/session returned', { 
        hasUser: !!data.user,
        hasSession: !!data.session 
      }, 'Auth');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Помилка створення сесії' 
        },
        { status: 500 }
      );
    }

    logger.info('User logged in successfully', { 
      userId: data.user.id,
      email: data.user.email 
    }, 'Auth');

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
