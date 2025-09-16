import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ ЗАПАСНОГО ВХОДА - когда обычный вход не работает
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email та пароль обов\'язкові' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    // Аутентификация через Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Fallback login failed', { error }, 'Auth');
      return NextResponse.json(
        { error: 'Невірний email або пароль' },
        { status: 401 }
      );
    }

    logger.info('User logged in via fallback', { userId: data.user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    });

  } catch (error: any) {
    logger.error('Fallback login API error', error, 'Auth');
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
