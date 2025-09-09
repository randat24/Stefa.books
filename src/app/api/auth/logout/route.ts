import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ ВИХОДУ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Токен не знайдено' 
        },
        { status: 401 }
      );
    }

    // Устанавливаем сессию для выхода
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    if (error) {
      logger.error('Logout failed', { error: error.message }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Помилка при виході' 
        },
        { status: 400 }
      );
    }

    // Выход из системы
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      logger.error('Sign out failed', { error: signOutError.message }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Помилка при виході' 
        },
        { status: 400 }
      );
    }

    logger.info('User logged out successfully', {}, 'Auth');

    return NextResponse.json({
      success: true,
      message: 'Успішний вихід'
    });

  } catch (error: any) {
    logger.error('Logout API error', { error }, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
