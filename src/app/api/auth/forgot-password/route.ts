import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ============================================================================
// API ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ
// ============================================================================

const forgotPasswordSchema = z.object({
  email: z.string().email('Неправильний формат email')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validatedData = forgotPasswordSchema.parse(body);
    
    const { email } = validatedData;
    
    // Отправляем письмо для восстановления пароля
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    });

    if (error) {
      logger.error('Failed to send reset password email', { error }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не вдалося надіслати email для відновлення паролю' 
        },
        { status: 400 }
      );
    }

    logger.info('Reset password email sent', { email }, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Лист для відновлення паролю надіслано на email'
    });

  } catch (error: any) {
    logger.error('Forgot password API error', error, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
