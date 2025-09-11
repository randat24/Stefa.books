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

    // Создание профиля пользователя в базе данных
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        phone: validatedData.phone || null,
        subscription_type: 'mini', // По умолчанию базовый план
        status: 'active',
        role: 'user'
      });

    if (profileError) {
      logger.error('Failed to create user profile', { error: profileError }, 'Auth');
      
      // Удаляем пользователя из Auth, если не удалось создать профиль
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не вдалося створити профіль користувача' 
        },
        { status: 500 }
      );
    }

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
