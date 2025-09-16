import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ============================================================================
// API ДЛЯ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================================

const registerSchema = z.object({
  email: z.string().email('Неправильний формат email'),
  password: z.string().min(6, 'Пароль має містити принаймні 6 символів'),
  firstName: z.string().min(1, 'Ім\'я обов\'язкове'),
  lastName: z.string().min(1, 'Прізвище обов\'язкове'),
  phone: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validatedData = registerSchema.parse(body);
    
    const { email, password, firstName, lastName, phone } = validatedData;
    
    const supabase = await createSupabaseServerClient();
    // Регистрация пользователя через Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null
        }
      }
    });

    if (error) {
      logger.error('Registration failed', { error }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не вдалося зареєструвати користувача' 
        },
        { status: 400 }
      );
    }

    logger.info('User registered successfully', { userId: data.user?.id }, 'Auth');

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Користувач успішно зареєстрований'
    });

  } catch (error: any) {
    logger.error('Registration API error', error, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
