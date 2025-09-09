import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ============================================================================
// API ДЛЯ СБРОСА ПАРОЛЯ
// ============================================================================

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Пароль має містити принаймні 6 символів'),
  confirmPassword: z.string().min(6, 'Підтвердження пароля обов\'язкове')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validatedData = resetPasswordSchema.parse(body);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Получаем токен из заголовков или cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Токен не знайдено. Будь ласка, перейдіть за посиланням з листа.' 
        },
        { status: 401 }
      );
    }

    // Устанавливаем сессию для сброса пароля
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    if (sessionError || !sessionData.user) {
      logger.error('Invalid session for password reset', { error: sessionError }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Недійсна сесія. Будь ласка, спробуйте знову.' 
        },
        { status: 401 }
      );
    }

    logger.info('Password reset attempt', { userId: sessionData.user.id }, 'Auth');

    // Обновление пароля
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.password
    });

    if (updateError) {
      logger.error('Password update failed', { error: updateError.message }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не вдалося оновити пароль' 
        },
        { status: 400 }
      );
    }

    logger.info('Password updated successfully', { userId: sessionData.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Пароль успішно оновлено'
    });

  } catch (error: any) {
    logger.error('Reset password API error', { error }, 'Auth');
    
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
