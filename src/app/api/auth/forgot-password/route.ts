import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ============================================================================
// API ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ
// ============================================================================

const forgotPasswordSchema = z.object({
  email: z.string().email('Неправильний формат email')
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validatedData = forgotPasswordSchema.parse(body);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    logger.info('Password reset request', { email: validatedData.email }, 'Auth');

    // Отправка письма для сброса пароля
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      logger.error('Password reset failed', { error: error.message }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не вдалося надіслати лист для скидання пароля' 
        },
        { status: 400 }
      );
    }

    logger.info('Password reset email sent', { email: validatedData.email }, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Лист з інструкціями надіслано на вашу електронну пошту'
    });

  } catch (error: any) {
    logger.error('Forgot password API error', { error }, 'Auth');
    
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
