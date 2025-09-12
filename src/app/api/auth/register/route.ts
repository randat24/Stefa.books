import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logger.info('User registration attempt', { email: validatedData.email }, 'Auth');

    // Создание пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Автоматически подтверждаем email для упрощения
      user_metadata: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        phone: validatedData.phone || null
      }
    });

    if (authError) {
      logger.error('Registration failed', { error: authError.message }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: authError.message 
        },
        { status: 400 }
      );
    }

    // Временно пропускаем создание профиля - пользователь может создать его позже
    // Профиль будет создан автоматически при первом входе
    logger.info('User created in auth, profile will be created on first login', { userId: authData.user.id }, 'Auth');

    logger.info('User registered successfully', { userId: authData.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Користувач успішно зареєстрований',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      }
    });

  } catch (error: any) {
    logger.error('Registration API error', error, 'Auth');
    
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
