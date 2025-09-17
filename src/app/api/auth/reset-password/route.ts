import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
  path: ["confirmPassword"] });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validatedData = resetPasswordSchema.parse(body);
    
    const { password } = validatedData;
    
    // Получаем токен из заголовков
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Токен авторизації відсутній' 
        },
        { status: 401 }
      );
    }

    
    // Обновляем пароль пользователя
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      logger.error('Failed to reset password', { error }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не вдалося оновити пароль' 
        },
        { status: 400 }
      );
    }

    logger.info('Password reset successfully', 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Пароль успішно оновлено'
    });

  } catch (error: any) {
    logger.error('Reset password API error', error, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
